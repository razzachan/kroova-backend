======== INÍCIO DO ARQUIVO ========

# 💳 Fluxo Financeiro Kroova

Este documento descreve como funciona todo o dinheiro dentro da Kroova: depósitos, boosters, reciclagem e saques. Não define código. Define lógica, regras e responsabilidades.

---

## 🧠 Conceitos Gerais

- A Kroova possui uma carteira interna ("wallet") para cada usuário.
- Essa carteira guarda valores em:
  - reais (BRL)
  - cripto (valores convertidos quando necessário)
- A plataforma registra todas as ações financeiras como “transações”.
- Nenhuma transação some: tudo deixa rastro (anti-fraude).
- Usuários podem comprar sem conta: isso gera inventário pendente vinculado ao e-mail.

---

## 💸 Depósitos (PIX / Cartão)

### Como funciona:

1. O usuário escolhe um valor e forma de pagamento.
2. A Kroova cria um pagamento no provedor (Stripe/Juno/etc).
3. Assim que o provedor confirma o pagamento, a Kroova recebe o webhook.
4. Ao receber, a Kroova adiciona o valor dentro da wallet do usuário (ou cria inventário pendente se o usuário não tem conta ainda).
5. Cada depósito vira uma transação registrada.

### Regra importante:

- Se o usuário ainda **não tiver conta**, os boosters comprados ficam guardados em um “inventário pendente” vinculado ao **e-mail usado no pagamento**.

---

## 👤 Compras sem conta (Guest)

### Funcionamento:

- O usuário pode comprar boosters **apenas informando e-mail**.
- A Kroova só libera os boosters quando o e-mail usado no pagamento é associado a uma conta criada.
- Quando o usuário cria conta com o mesmo e-mail, ele recebe todos os boosters pagos, ainda fechados.

### Objetivo:

- Permitir impulsos de compra.
- Facilitar vendas sem burocracia.
- Evitar fraude (alguém não pode desbloquear algo que não seja do seu e-mail).

---

## 🎁 Compra e Abertura de Boosters (Logado)

### Compra:

- Quando o usuário está logado, a compra é paga com saldo da própria wallet interna.
- Se não tiver saldo suficiente, a compra não ocorre.
- Cada compra vira transação registrada.

### Abertura:

- Abrir booster cria cartas permanentes no inventário.
- Cada carta virá com um valor mínimo garantido (a Kroova se compromete a recomprar).
- Essas cartas podem ser vendidas no marketplace, recicladas ou mantidas no inventário.

---

## ♻ Reciclagem de Cartas (Liquidez Garantida)

### O que é reciclar:

- O usuário devolve uma carta e recebe o valor mínimo garantido dela.
- É como uma recompra direta pela Kroova.

### O que acontece:

- A carta é removida do inventário.
- O valor mínimo (em BRL ou Cripto) entra na wallet do usuário.
- Isso cria uma transação de reciclagem.

📌 **Isso garante liquidez:** nenhuma carta fica “sem valor”.

---

## 🏧 Saque (PIX)

### Requisitos:

- CPF deve estar cadastrado.
- O PIX precisa ser do mesmo CPF vinculado ao usuário.

### Regras:

- Taxa fixa de **4%** aplicada sobre o valor sacado.
- Para evitar lavagem de dinheiro, existem limites:
  - R$ 1.500 por dia
  - R$ 7.500 por semana
  - R$ 30.000 por mês

### Funcionamento:

- Quando o usuário pede saque, o valor é reservado e aguardando confirmação.
- Após confirmação do PIX, a transação é finalizada.
- Se o saque violar limite, fica pendente para revisão manual.

---

## 🪙 Saque por Cripto

### Diferença do PIX:

- Não exige CPF.
- Não tem limite rígido.
- Apenas alerta interno se o valor sacado por dia ultrapassar o equivalente a R$ 2.500.

### Funcionamento:

- O valor sai da wallet cripto do usuário.
- A Kroova envia para a carteira indicada.
- A transação recebe o hash da blockchain.

---

## 🚨 Erros e Motivos

- **NEEDS_AUTH** → Precisa estar logado.
- **NEEDS_CPF** → Saque PIX exige CPF.
- **INSUFFICIENT_FUNDS** → Saldo insuficiente.
- **LIMIT_REACHED** → Limite de saque excedido.
- **PAYMENT_VERIFICATION_FAILED** → Webhook inválido.
- **PENDING_INVENTORY_NOT_FOUND** → Tentativa de resgatar inventário inexistente.

---

## 🏁 Resumo Final

- Dinheiro entra via provedor → vira saldo interno (ou inventário pendente).
- Gastos internos sempre registram transações (compra, abertura, reciclagem).
- Nenhuma carta vale zero, pois existe reciclagem (liquidez garantida).
- Saques BRL exigem CPF e possuem limites.
- Saques cripto não exigem CPF, apenas alertas.

📌 **Este documento define regras, não código. O Copilot implementa automaticamente o restante.**

---

© Kroova Labs — Todos os direitos reservados.

======== FIM DO ARQUIVO ========
