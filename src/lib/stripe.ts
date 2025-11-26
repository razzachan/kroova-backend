import Stripe from "stripe";
import { env } from "../config/env.js";
import { STRIPE_CREDITS_NAME } from "../config/brand.js";

/**
 * 💳 Stripe API Client
 * Gerencia pagamentos PIX e cartão
 */
export const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: "2023-10-16",
});

/**
 * Cria checkout session para depósito
 */
export async function createDepositSession(params: {
  amount: number;
  email: string;
  userId?: string;
}) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: STRIPE_CREDITS_NAME,
            description: `Depósito de R$ ${params.amount.toFixed(2)}`,
          },
          unit_amount: Math.round(params.amount * 100), // Centavos
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${env.appUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.appUrl}/payment/cancel`,
    customer_email: params.email,
    metadata: {
      user_id: params.userId || "",
      email: params.email,
      type: "deposit",
    },
  });

  return session;
}

/**
 * Cria PIX payment intent
 */
export async function createPixPayment(params: { amount: number; email: string; userId?: string }) {
  // Stripe suporta PIX via Payment Intents
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(params.amount * 100),
    currency: "brl",
    payment_method_types: ["pix"],
    receipt_email: params.email,
    metadata: {
      user_id: params.userId || "",
      email: params.email,
      type: "deposit",
    },
  });

  return paymentIntent;
}

/**
 * Valida webhook do Stripe
 */
export function verifyWebhook(payload: string, signature: string): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, env.stripeWebhookSecret);
}
