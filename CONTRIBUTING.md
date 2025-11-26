# 🤝 Guia de Contribuição — Kroova Backend

Obrigado por contribuir com o projeto Kroova! Este guia garante que todos sigam os mesmos padrões.

---

## 📋 Antes de Começar

1. ✅ Leia **todos** os arquivos `.md` relacionados à sua funcionalidade
2. ✅ Certifique-se de que você entende as especificações
3. ✅ Em caso de dúvida, **pergunte** antes de implementar

🔒 **Regra de Ouro:** Implementar **exatamente** conforme especificado nos `.md`, sem interpretações.

---

## 🛠️ Setup do Ambiente

```bash
# Clone o repositório
git clone <repo-url>
cd kroova-backend

# Execute o setup (instala deps + configura hooks)
.\setup.ps1

# Configure o .env
copy .env.example .env
# Edite o .env com suas credenciais

# Rode os testes
npm test

# Inicie o servidor
npm run dev
```

---

## 📝 Padrão de Commits

Utilizamos **Conventional Commits** com validação automática:

### Tipos permitidos:

- `feat:` — Nova funcionalidade
- `fix:` — Correção de bug
- `docs:` — Documentação
- `style:` — Formatação de código
- `refactor:` — Refatoração (sem mudança de comportamento)
- `test:` — Adição/correção de testes
- `chore:` — Tarefas gerais (build, deps, etc)
- `perf:` — Melhorias de performance
- `ci:` — CI/CD
- `revert:` — Reverter commit anterior

### Exemplos:

```bash
feat: adicionar rota de compra de boosters
fix: corrigir cálculo de taxa no marketplace
docs: atualizar README com novas rotas
refactor: reorganizar estrutura de pastas
test: adicionar testes para módulo wallet
```

---

## 🧪 Testes

### Rodar testes:

```bash
npm test                # Roda todos os testes
npm run test:watch      # Modo watch
npm run test:coverage   # Com cobertura
```

### Criar testes:

- Testes ficam em `src/test/` ou ao lado do arquivo testado
- Use sufixo `.test.ts` ou `.spec.ts`
- Siga o padrão AAA (Arrange, Act, Assert)

**Exemplo:**

```typescript
import { test, expect, describe } from "vitest";

describe("Meu Módulo", () => {
  test("deve fazer X", () => {
    // Arrange
    const input = "teste";

    // Act
    const result = minhaFuncao(input);

    // Assert
    expect(result).toBe("esperado");
  });
});
```

---

## 🎨 Code Style

### Lint & Format:

```bash
npm run lint           # Verificar erros
npm run lint:fix       # Corrigir automaticamente
npm run format         # Formatar código
npm run format:check   # Verificar formatação
```

### Regras principais:

✅ **Fazer:**

- Usar TypeScript corretamente (evitar `any`)
- Seguir nomenclatura camelCase para variáveis/funções
- Usar PascalCase para classes
- Documentar funções complexas com JSDoc
- Manter funções pequenas e focadas

❌ **Evitar:**

- Usar `any` sem necessidade
- Criar funções gigantes (> 50 linhas)
- Deixar `console.log` em produção (exceto logs estruturados)
- Comentários óbvios

---

## 🔐 Segurança

### Nunca commitar:

- ❌ Arquivo `.env`
- ❌ Chaves privadas
- ❌ Tokens/secrets
- ❌ Credenciais de teste

### Sempre:

- ✅ Usar variáveis de ambiente
- ✅ Criptografar dados sensíveis
- ✅ Validar inputs do usuário
- ✅ Seguir `KROUVA_SECURITY_AND_ANTIFRAUD.md`

---

## 📂 Estrutura de Pastas

```
src/
├── config/           # Configurações (env, db, etc)
├── http/             # Camada HTTP
│   ├── routes/       # Definição de rotas
│   ├── controllers/  # Lógica das rotas
│   ├── middlewares/  # Auth, validação
│   └── validators/   # Schemas Zod
├── modules/          # Domínios de negócio
│   ├── auth/
│   ├── wallet/
│   ├── booster/
│   ├── card/
│   ├── market/
│   └── nft/
├── lib/              # Utilitários
└── errors/           # Tratamento de erros
```

---

## 🚀 Fluxo de Desenvolvimento

1. **Crie uma branch:**

   ```bash
   git checkout -b feat/nome-da-feature
   ```

2. **Implemente seguindo os `.md`:**
   - Leia a especificação
   - Implemente exatamente conforme descrito
   - Não invente regras

3. **Teste localmente:**

   ```bash
   npm test
   npm run lint
   ```

4. **Commit com padrão:**

   ```bash
   git add .
   git commit -m "feat: descrição clara"
   ```

5. **Push e PR:**
   ```bash
   git push origin feat/nome-da-feature
   # Abra um Pull Request
   ```

---

## 🔍 Code Review

Pull Requests devem:

- ✅ Seguir exatamente as especificações `.md`
- ✅ Passar em todos os testes
- ✅ Não ter erros de lint
- ✅ Ter commits bem formatados
- ✅ Incluir testes para novas funcionalidades

---

## 📚 Documentação de Referência

Antes de implementar qualquer feature, consulte:

| Área           | Arquivo                                             |
| -------------- | --------------------------------------------------- |
| Rotas          | `KROUVA_API_ROUTES.md` (legacy: `KROOVA_API_ROUTES.md`) |
| Autenticação   | `KROUVA_AUTH_RULES.md` (legacy: `KROOVA_AUTH_RULES.md`) |
| Banco de Dados | `KROUVA_DB_SCHEMA.md` (legacy: `KROOVA_DB_SCHEMA.md`) |
| Pagamentos     | `KROUVA_PAYMENT_FLOW.md` (legacy: `KROOVA_PAYMENT_FLOW.md`) |
| Boosters       | `KROUVA_BOOSTER_ALGORITHM.md` (legacy: `KROOVA_BOOSTER_ALGORITHM.md`) |
| Marketplace    | `KROUVA_MARKETPLACE_RULES.md` (legacy: `KROOVA_MARKETPLACE_RULES.md`) |
| NFT            | `KROUVA_NFT_PROTOCOL.md`, `KROUVA_NFT_MINT_FLOW.md` (legacy: `KROOVA_*`) |
| Segurança      | `KROUVA_SECURITY_AND_ANTIFRAUD.md` (legacy: `KROOVA_SECURITY_AND_ANTIFRAUD.md`) |
| Branding       | `KROUVA_BRANDING.md` (legacy: `KROOVA_BRANDING.md`) |

---

## ❓ Dúvidas?

1. Verifique se a resposta está nos arquivos `.md`
2. Procure issues existentes no projeto
3. Abra uma issue ou discussão

---

**🎯 Lembre-se:** O Copilot e desenvolvedores são **executores**, não **decisores**.  
Toda regra de negócio está documentada e deve ser seguida fielmente.

---

© Kroova Labs — Todos os direitos reservados.
