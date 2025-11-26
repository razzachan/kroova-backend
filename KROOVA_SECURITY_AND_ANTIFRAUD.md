# 🛡️ KROOVA_SECURITY_AND_ANTIFRAUD.md

> Regras oficiais de segurança, prevenção e reação antifraude da plataforma Kroova.  
> Aplicável a pagamentos, marketplace, reciclagem e movimentação de inventário.

---

## 1. Filosofia de Segurança Kroova

A Kroova protege o sistema com base em três princípios:

| Princípio                | Significado                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| **Custódia inteligente** | Usuário possui cartas e saldo, mas a Kroova assegura transações atômicas e validade.      |
| **Economia vigiada**     | Cada comportamento financeiro deixa rastro de auditoria. Nada acontece “fora do livro”.   |
| **Confiança contratada** | O jogador confia no protocolo e não na sorte de terceiros. Segurança é produto do design. |

> “Fraude não é erro de quem joga. É falha de quem projeta o jogo.”

---

## 2. Áreas Sensíveis Protegidas

| Área        | Ameaça                                   | Proteção                                  |
| ----------- | ---------------------------------------- | ----------------------------------------- |
| Depósitos   | Comprovação falsa, chargeback            | Webhook verificado + inventário pendente  |
| Saques      | Lavagem, autopagamento, múltiplas contas | CPF obrigatório + limites + retenção      |
| Marketplace | Wash trading, preço abusivo              | Taxas, monitoramento, bloqueio temporário |
| Reciclagem  | Farm de valor, bots                      | Limites ocultos + análise por volume      |
| Inventário  | Transferência indevida, clone            | Custódia central + atomic swap            |

---

## 3. Política de Identidade e CPF

| Ação                  | CPF Obrigatório?         |
| --------------------- | ------------------------ |
| Criar conta           | ❌ Não                   |
| Comprar boosters      | ❌ Não                   |
| Vender no marketplace | ✔ Sim                   |
| Sacar dinheiro (PIX)  | ✔ Sim                   |
| Reciclar para BRL     | ✔ Sim                   |
| Sacar cripto          | ❌ Mas pode gerar alerta |

📌 Regra: **PIX deve sempre estar vinculado ao mesmo CPF do usuário.**

---

## 4. Alertas, Travas e Retenções

Nem toda ação suspeita gera bloqueio. A Kroova usa **4 níveis de resposta:**

| Nível | Nome             | Ação                              |
| ----- | ---------------- | --------------------------------- |
| 0     | Observação       | Apenas log                        |
| 1     | Alerta           | Notifica e limita temporariamente |
| 2     | Retenção         | Segura saque/transação            |
| 3     | Banimento/Freeze | Congela perfil até verificação    |

### Exemplos de gatilhos automáticos

| Situação                                       | Nível |
| ---------------------------------------------- | ----- |
| Muitas compras entre dois usuários             | 1–2   |
| Preço discrepante > 4× média                   | 1     |
| Conta nova recebendo alto volume               | 2     |
| Saque com saldo proveniente de uma única conta | 2     |
| Múltiplos CPFs no mesmo aparelho/IP            | 2–3   |
| Reciclagem massiva em curto prazo              | 1–2   |
| Uso de VPN em transações financeiras           | 2     |

---

## 5. Proteção Contra Wash Trading (lavagem via marketplace)

### Indicadores automáticos:

- Mesmo comprador e vendedor ― **repetidos**
- Volume acima da média em curto período
- Ciclos (A compra de B, B compra de A)
- Contas recém criadas com valores altos

### Ações automáticas:

- **Taxa aumenta temporariamente** (4% → 10% para envolvidos)
- **Bloqueio de saque** por 72 horas
- Análise manual se persistir

📌 **Compra e venda repetida não é proibida, mas torna-se cara e investigada.**

---

## 6. Reciclagem — Anti Farm/Script

Reciclagem paga liquidez garantida → alvo para bots.

### Regras internas invisíveis ao jogador:

- Limite dinâmico por dia/usuário (baseado no RTP e volume da edição)
- Redução automática do valor de reciclagem se:
  - a carta estiver sendo reciclada em massa
  - o custo da edição ainda não foi amortizado

📌 A reciclagem protege o jogador, **não deve ser fonte de lucro automático.**

---

## 7. Saques (BRL + Cripto)

### Proteções já definidas:

✔ PIX exige CPF igual ao cadastrado  
✔ Limites: R$ 1.500/dia, R$ 7.500/semana, R$ 30.000/mês  
✔ Taxa de 4%

### Regras adicionais (segurança):

- Saques podem ser **retidos automaticamente** quando:
  - 80%+ do saldo vier do mesmo vendedor
  - conta tiver menos de 48h
  - movimentação for anormalmente alta
- Saques em cripto → **alerta acima de R$ 2.500/dia convertido**

---

## 8. Auditoria e Registro de Hash

Toda operação financeira relevante gera uma **hash de auditoria**, que pode ser:

- local (Postgres)
- derivada (hash concatenada)
- blockchain (quando houver mint or wallet movement)

Isso permite reconstruir o estado do sistema em caso de disputa.

📌 **Transparência é arma contra fraude.**

---

## 9. Penalidades

| Ação                                         | Penalidade                                 |
| -------------------------------------------- | ------------------------------------------ |
| Múltiplas contas para manipular mercado      | Freeze + retenção de 30 dias               |
| Manipulação de preço com terceiros           | Aumento de taxa + bloqueio de saque        |
| Tentativa de sacudir saldo reciclado com bot | Limite dinâmico + freeze                   |
| Documento falso em verificação               | Ban + notificação policial se houver saque |

> “Jogador pode blefar na carta. Não pode blefar contra o banco.”

---

## 10. Resumo para o Copilot

- **PIX só com CPF igual.**
- **Toda transação gera hash e transaction.**
- **Marketplace exige CPF para vender.**
- **Compra e venda repetida dispara taxa e retenção.**
- **Reciclagem tem limites invisíveis.**
- **Sacou = audited.**
- **Cripto não exige CPF, mas aciona alerta.**
- **Fraudes repetidas = freeze + verificação.**

---

**© Kroova Labs — Segurança como pilar da economia.**
