# 💎 Boas Práticas de Desenvolvimento — Kroova Backend

Este documento complementa o [Guia de Contribuição](CONTRIBUTING.md) com práticas específicas do projeto Kroova.

---

## 🎯 Filosofia do Projeto

> **"O Copilot e desenvolvedores são executores, não decisores."**

Todo comportamento do sistema está documentado nos arquivos `.md`. Nunca invente regras.

---

## 📝 Escrevendo Código

### 1. TypeScript

✅ **Fazer:**

```typescript
// Tipos explícitos em funções públicas
export function calculateFee(amount: number): number {
  return amount * 0.04;
}

// Interfaces para objetos complexos
interface User {
  id: string;
  email: string;
  cpf?: string;
}

// Enums para valores fixos
enum TransactionType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  MARKET_BUY = "market_buy",
}
```

❌ **Evitar:**

```typescript
// Evitar any
function process(data: any) {} // ❌

// Tipos implícitos em funções públicas
function calc(x, y) {
  return x + y;
} // ❌

// Strings literais sem enum/const
const type = "withdraw"; // ❌ Use enum
```

---

### 2. Nomenclatura

| Elemento   | Padrão      | Exemplo                                 |
| ---------- | ----------- | --------------------------------------- |
| Variáveis  | camelCase   | `userName`, `walletBalance`             |
| Funções    | camelCase   | `getUserById`, `calculateTax`           |
| Classes    | PascalCase  | `UserService`, `WalletController`       |
| Interfaces | PascalCase  | `IUser`, `CreateUserDto`                |
| Enums      | PascalCase  | `TransactionStatus`, `ErrorCode`        |
| Constantes | UPPER_SNAKE | `MAX_WITHDRAW_LIMIT`, `TAX_RATE`        |
| Arquivos   | kebab-case  | `user-service.ts`, `auth-middleware.ts` |

---

### 3. Funções e Métodos

✅ **Fazer:**

```typescript
// Funções pequenas e focadas
async function getUserWallet(userId: string): Promise<Wallet> {
  return await supabase.from("wallets").select("*").eq("user_id", userId).single();
}

// Documentação quando necessário
/**
 * Calcula a taxa de 4% sobre o valor de saque
 * @param amount Valor do saque em BRL
 * @returns Taxa calculada (4%)
 */
function calculateWithdrawFee(amount: number): number {
  const TAX_RATE = 0.04;
  return amount * TAX_RATE;
}
```

❌ **Evitar:**

```typescript
// Funções gigantes (> 50 linhas)
function processEverything() {
  // 200 linhas de código...
}

// Nomes genéricos
function process() {}
function handle() {}
function doStuff() {}
```

---

### 4. Tratamento de Erros

✅ **Fazer:**

```typescript
import { HttpError } from "../errors/http-error.js";
import { ErrorCodes } from "../errors/codes.js";

// Erros específicos com códigos
if (!user) {
  throw new HttpError(404, ErrorCodes.NOT_FOUND, "User not found");
}

if (wallet.balance_brl < amount) {
  throw new HttpError(400, ErrorCodes.INSUFFICIENT_FUNDS, "Insufficient balance");
}

// Try-catch para operações externas
try {
  await stripeApi.createCharge(amount);
} catch (error) {
  console.error("Stripe error:", error);
  throw new HttpError(500, ErrorCodes.PAYMENT_VERIFICATION_FAILED, "Payment failed");
}
```

---

### 5. Validação de Dados

✅ **Usar Zod para validação:**

```typescript
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

type CreateUserDto = z.infer<typeof createUserSchema>;

// Em um controller
const data = createUserSchema.parse(request.body);
```

---

### 6. Async/Await

✅ **Fazer:**

```typescript
// Async/await legível
async function purchaseBooster(userId: string, boosterId: string) {
  const wallet = await getWallet(userId);
  const booster = await getBooster(boosterId);

  if (wallet.balance_brl < booster.price_brl) {
    throw new HttpError(400, ErrorCodes.INSUFFICIENT_FUNDS, "No balance");
  }

  await debitWallet(userId, booster.price_brl);
  return await createBoosterOpening(userId, boosterId);
}

// Parallel quando possível
const [user, wallet, inventory] = await Promise.all([
  getUser(userId),
  getWallet(userId),
  getInventory(userId),
]);
```

❌ **Evitar:**

```typescript
// Callback hell
getUserWallet(userId, (wallet) => {
  getBooster(boosterId, (booster) => {
    // ...
  });
});

// Await desnecessário em sequência
const user = await getUser(userId);
const wallet = await getWallet(userId); // Poderia ser parallel
```

---

## 🗄️ Banco de Dados

### 1. Queries

✅ **Fazer:**

```typescript
// Queries específicas
const user = await supabase
  .from("users")
  .select("id, email, cpf_verified")
  .eq("id", userId)
  .single();

// Evitar N+1 queries - usar joins
const cardsWithBase = await supabase
  .from("cards_instances")
  .select(
    `
    *,
    cards_base (
      name,
      rarity,
      image_url
    )
  `,
  )
  .eq("owner_id", userId);
```

❌ **Evitar:**

```typescript
// Select * desnecessário
const user = await supabase.from("users").select("*");

// N+1 queries
const cards = await getCards(userId);
for (const card of cards) {
  const base = await getCardBase(card.base_id); // ❌
}
```

---

### 2. Transações

Para operações que precisam ser atômicas:

```typescript
// Usar transações do Postgres
const { data, error } = await supabase.rpc("transfer_card_atomic", {
  p_card_id: cardId,
  p_from_user: sellerId,
  p_to_user: buyerId,
  p_amount: price,
});
```

---

## 🔐 Segurança

### 1. Dados Sensíveis

✅ **Fazer:**

```typescript
// Sempre criptografar chaves privadas
import { encrypt } from "../lib/crypto.js";

const encryptedKey = encrypt(privateKey);
await saveWallet({ ...wallet, wallet_private_enc: encryptedKey });

// Validar CPF apenas quando necessário
if (operation === "withdraw" && !user.cpf) {
  throw new HttpError(400, ErrorCodes.NEEDS_CPF, "CPF required");
}
```

❌ **Evitar:**

```typescript
// Salvar chaves em plain text
await saveWallet({ private_key: privateKey }); // ❌

// Expor dados sensíveis em logs
console.log("User password:", password); // ❌
console.log("Private key:", privateKey); // ❌
```

---

### 2. Validação de Inputs

**SEMPRE validar dados do usuário:**

```typescript
import { isValidCPF } from "../lib/utils.js";

// Validar formato
if (!isValidCPF(cpf)) {
  throw new HttpError(400, ErrorCodes.INVALID_CPF, "Invalid CPF format");
}

// Validar ranges
if (amount <= 0) {
  throw new HttpError(400, ErrorCodes.BAD_REQUEST, "Amount must be positive");
}

// Sanitizar strings
const cleanEmail = email.toLowerCase().trim();
```

---

## 🧪 Testes

### 1. Estrutura de Testes

```typescript
import { describe, test, expect, beforeAll, afterAll } from "vitest";

describe("Wallet Module", () => {
  beforeAll(() => {
    // Setup
  });

  afterAll(() => {
    // Cleanup
  });

  describe("getBalance", () => {
    test("should return wallet balance", async () => {
      // Arrange
      const userId = "test-user-id";

      // Act
      const balance = await getBalance(userId);

      // Assert
      expect(balance).toBeDefined();
      expect(balance.balance_brl).toBeGreaterThanOrEqual(0);
    });

    test("should throw error for invalid user", async () => {
      // Arrange
      const invalidUserId = "invalid";

      // Act & Assert
      await expect(getBalance(invalidUserId)).rejects.toThrow();
    });
  });
});
```

---

### 2. Mocks

```typescript
import { vi } from "vitest";

// Mock de módulo externo
vi.mock("../config/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: mockData }),
    })),
  },
}));
```

---

## 📊 Performance

### 1. Otimizações

✅ **Fazer:**

```typescript
// Cache quando apropriado
const cache = new Map();

function getBoosterType(id: string) {
  if (cache.has(id)) return cache.get(id);

  const booster = await fetchBoosterType(id);
  cache.set(id, booster);
  return booster;
}

// Pagination
const { data, count } = await supabase
  .from("cards_instances")
  .select("*", { count: "exact" })
  .range(offset, offset + limit - 1);
```

---

## 📝 Documentação

### 1. README de Módulos

Cada módulo pode ter um README.md explicando:

- Propósito do módulo
- Funções principais
- Exemplos de uso
- Referências aos `.md` oficiais

### 2. JSDoc

Use JSDoc para funções públicas complexas:

```typescript
/**
 * Recicla uma carta e credita o valor de liquidez na wallet do usuário
 *
 * @param userId - ID do usuário
 * @param cardInstanceId - ID da instância da carta
 * @returns Transação de reciclagem criada
 * @throws {HttpError} CARD_NOT_FOUND - Se a carta não existir
 * @throws {HttpError} CARD_NOT_OWNED - Se a carta não pertencer ao usuário
 *
 * @see KROUVA_PAYMENT_FLOW.md para regras de reciclagem
 */
async function recycleCard(userId: string, cardInstanceId: string): Promise<Transaction> {
  // ...
}
```

---

## 🚫 Anti-Patterns

❌ **Evitar:**

1. **God Objects** — Classes/funções que fazem tudo
2. **Magic Numbers** — Use constantes nomeadas
3. **Callback Hell** — Use async/await
4. **Código duplicado** — DRY (Don't Repeat Yourself)
5. **Comentários óbvios** — `// incrementa i` é desnecessário
6. **Commits gigantes** — Commits pequenos e focados

---

## ✅ Checklist Antes de Commitar

- [ ] Código compila sem erros (`npm run build`)
- [ ] Testes passam (`npm test`)
- [ ] Lint OK (`npm run lint`)
- [ ] Formatação OK (`npm run format`)
- [ ] Segue especificação dos `.md`
- [ ] Commit message segue padrão Conventional Commits
- [ ] Não commitou dados sensíveis

---

**💎 Lembre-se:** Código bom é código legível, testável e que segue as especificações.

---

© Kroova Labs — Todos os direitos reservados.
