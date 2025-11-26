#!/usr/bin/env node

/**
 * 🔍 Post-Deploy Validation Script
 * 
 * Executa verificações automáticas após deploy para garantir
 * que todos os sistemas críticos estão funcionando.
 * 
 * Uso:
 *   node scripts/validate-deployment.js --url https://api.kroova.gg
 */

const https = require('https');
const http = require('http');

// Configuração
const args = process.argv.slice(2);
const baseUrl = args.find(arg => arg.startsWith('--url='))?.split('=')[1] || 'http://localhost:3333';
const timeout = 10000; // 10s timeout

console.log(`\n🔍 Validando deployment em: ${baseUrl}\n`);

// Utilidades
function makeRequest(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Kroova-Deployment-Validator/1.0'
      },
      timeout
    };

    if (body) {
      const bodyStr = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function pass(message) {
  console.log(`✅ ${message}`);
}

function fail(message) {
  console.log(`❌ ${message}`);
  process.exitCode = 1;
}

function warn(message) {
  console.log(`⚠️  ${message}`);
}

function info(message) {
  console.log(`ℹ️  ${message}`);
}

// Testes
const tests = {
  async rootPing() {
    info('Verificando root / ...');
    try {
      const res = await makeRequest(`${baseUrl}/`);
      if (res.status === 200 && (res.data.ok || res.data.message)) {
        pass('Root responde OK');
        return true;
      }
      fail(`Root retornou ${res.status}`);
      return false;
    } catch (e) {
      fail(`Root ping falhou: ${e.message}`);
      return false;
    }
  },
  async healthCheck() {
    info('Verificando health endpoint...');
    try {
      const res = await makeRequest(`${baseUrl}/health`);
      if (res.status === 200) {
        pass('Health check OK');
        return true;
      } else {
        fail(`Health check retornou ${res.status}`);
        return false;
      }
    } catch (e) {
      fail(`Health check falhou: ${e.message}`);
      return false;
    }
  },

  async listBoosters() {
    info('Verificando endpoint de boosters...');
    try {
      const res = await makeRequest(`${baseUrl}/api/v1/boosters`);
      if (res.status === 200 && res.data.data && Array.isArray(res.data.data)) {
        pass(`Boosters listados: ${res.data.data.length} tipos disponíveis`);
        return true;
      } else {
        fail(`Endpoint de boosters retornou status ${res.status}`);
        return false;
      }
    } catch (e) {
      fail(`Erro ao listar boosters: ${e.message}`);
      return false;
    }
  },

  async auditDashboard() {
    info('Verificando audit dashboard...');
    try {
      const res = await makeRequest(`${baseUrl}/internal/audit-dashboard`);
      if (res.status === 200) {
        const { thresholds, currentDistribution, rtpAlerts } = res.data;
        if (thresholds && currentDistribution && rtpAlerts) {
          pass('Audit dashboard OK');
          info(`  RTP Alerts: HIGH=${rtpAlerts.high_count}, LOW=${rtpAlerts.low_count}`);
          info(`  Distribuição: ${currentDistribution.total} cartas geradas`);
          return true;
        } else {
          warn('Audit dashboard com estrutura incompleta');
          return false;
        }
      } else if (res.status === 403) {
        warn('Audit dashboard protegido (esperado em produção)');
        return true;
      } else {
        fail(`Audit dashboard retornou ${res.status}`);
        return false;
      }
    } catch (e) {
      fail(`Erro ao acessar audit dashboard: ${e.message}`);
      return false;
    }
  },

  async economicSeries() {
    info('Verificando economic series...');
    try {
      const res = await makeRequest(`${baseUrl}/internal/economic-series?limit=1`);
      const dataList = (res.data && Array.isArray(res.data.items))
        ? res.data.items
        : (res.data && Array.isArray(res.data.data))
          ? res.data.data
          : [];
      if (res.status === 200) {
        if (dataList.length > 0) {
          const entry = dataList[0];
          pass('Economic series OK');
          info(`  RTP atual: ${entry.rtp_pct?.toFixed(2)}%`);
          info(`  Margem: ${entry.gross_margin_pct?.toFixed(2)}%`);
          info(`  Receita total: R$ ${entry.total_revenue_brl?.toFixed(2)}`);
          
          // Verificar integridade se habilitada
          if (entry.hash && entry.prev_hash) {
            pass('Hash chain habilitada e presente');
          }
          return true;
        } else {
          warn('Economic series vazia (esperado em deploy fresh)');
          return true;
        }
      } else if (res.status === 403) {
        warn('Economic series protegida (esperado em produção)');
        return true;
      } else {
        fail(`Economic series retornou ${res.status}`);
        return false;
      }
    } catch (e) {
      fail(`Erro ao acessar economic series: ${e.message}`);
      return false;
    }
  },

  async cardsSeed() {
    info('Verificando seed de cartas ED01...');
    // Nota: requer endpoint público ou acesso interno
    // Por simplicidade, validamos via booster list que depende de cards_base
    try {
      const res = await makeRequest(`${baseUrl}/api/v1/boosters`);
      if (res.status === 200 && res.data.data && res.data.data.length > 0) {
        pass('Cards ED01 provavelmente seedadas (boosters disponíveis)');
        return true;
      } else {
        warn('Não foi possível validar seed de cartas diretamente');
        return false;
      }
    } catch (e) {
      warn(`Não foi possível validar seed: ${e.message}`);
      return false;
    }
  },

  async responseTime() {
    info('Medindo response time...');
    const start = Date.now();
    try {
      await makeRequest(`${baseUrl}/health`);
      const elapsed = Date.now() - start;
      if (elapsed < 500) {
        pass(`Response time: ${elapsed}ms (excelente)`);
      } else if (elapsed < 1000) {
        warn(`Response time: ${elapsed}ms (aceitável)`);
      } else {
        fail(`Response time: ${elapsed}ms (muito lento)`);
      }
      return true;
    } catch (e) {
      fail(`Erro ao medir response time: ${e.message}`);
      return false;
    }
  },

  async securityHeaders() {
    info('Verificando security headers...');
    try {
      const res = await makeRequest(`${baseUrl}/health`);
      const headers = res.headers;
      
      let passed = 0;
      let total = 0;

      const checks = [
        { header: 'x-content-type-options', expected: 'nosniff' },
        { header: 'x-frame-options', expected: ['DENY', 'SAMEORIGIN'] },
        { header: 'strict-transport-security', expected: null }, // Qualquer valor OK
      ];

      for (const check of checks) {
        total++;
        const value = headers[check.header];
        if (value) {
          if (Array.isArray(check.expected)) {
            if (check.expected.some(exp => value.toLowerCase().includes(exp.toLowerCase()))) {
              passed++;
            }
          } else if (check.expected === null || value.toLowerCase().includes(check.expected.toLowerCase())) {
            passed++;
          }
        }
      }

      if (passed === total) {
        pass(`Security headers OK (${passed}/${total})`);
      } else {
        warn(`Security headers parciais (${passed}/${total})`);
      }
      return true;
    } catch (e) {
      warn(`Não foi possível verificar security headers: ${e.message}`);
      return false;
    }
  }
};

// Executor
(async () => {
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    total: 0
  };

  for (const [name, test] of Object.entries(tests)) {
    results.total++;
    console.log(`\n--- ${name} ---`);
    try {
      const result = await test();
      if (result) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (e) {
      console.error(`Erro inesperado: ${e.message}`);
      results.failed++;
    }
  }

  // Resumo
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMO DA VALIDAÇÃO');
  console.log('='.repeat(50));
  console.log(`Total de testes: ${results.total}`);
  console.log(`✅ Passou: ${results.passed}`);
  console.log(`❌ Falhou: ${results.failed}`);
  console.log(`⚠️  Avisos: ${results.warnings}`);
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`\nTaxa de sucesso: ${successRate}%`);

  if (results.failed === 0) {
    console.log('\n🎉 DEPLOY VALIDADO COM SUCESSO!\n');
    process.exit(0);
  } else if (results.failed <= 2) {
    console.log('\n⚠️  DEPLOY COM ISSUES MENORES - Revisar falhas\n');
    process.exit(1);
  } else {
    console.log('\n❌ DEPLOY COM PROBLEMAS CRÍTICOS - Considerar rollback\n');
    process.exit(1);
  }
})();
