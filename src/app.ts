import fastify from "fastify";
import cors from "@fastify/cors";
import { routes } from "./http/routes/index.js";
import { randomUUID } from "crypto";
import { metricsRequestHook, metricsErrorHook } from './observability/metrics.js';

export async function buildApp() {
  const app = fastify({
    logger: {
      level: "info",
    },
    genReqId() {
      return randomUUID();
    },
  });

  // Correlation: attach request id and basic metadata for each request
  app.addHook("onRequest", (req, _res, done) => {
    // Fastify's logger already binds req id; we enrich with method/path
    // Note: routerPath not available yet in onRequest, use url instead
    req.log = req.log.child({ url: req.url, method: req.method });
    done();
  });

  // Metrics: count every request arrival
  app.addHook('onRequest', metricsRequestHook());
  // Metrics: count errors (hook after error handler would miss, so use onError)
  app.addHook('onError', metricsErrorHook());

  app.setErrorHandler((err, _req, reply) => {
    app.log.error({ err }, "request error");
    reply.status(err.statusCode || 500).send({ error: err.message });
  });

  await app.register(cors);
  await app.register(routes);

  return app;
}
