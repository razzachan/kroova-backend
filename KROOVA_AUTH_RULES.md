======== INÍCIO DO ARQUIVO ========

🔐 KROOVA_AUTH_RULES.md (Legacy)

> Nota de transição: use `KROUVA_AUTH_RULES.md` para implementações novas. Este documento é mantido como histórico.

Regras de autenticação, identidade, segurança e permissões do ecossistema Kroova.
Stack-alvo: Supabase Auth + JWT + Node.js/TypeScript backend.

Este documento funciona como contrato funcional para o Copilot/Dev implementar:

Fluxo de login e cadastro

Estrutura de tokens (JWT)

Ligação entre auth.users do Supabase e tabela users do schema Kroova

Regras de CPF, saque, venda e reciclagem

Antifraude básico e proteção contra abuso/multi-conta

Perfis de permissão (user / admin / system)

🧬 Identidade do Usuário
Fonte de verdade (identity source)

A identidade base é gerida pelo Supabase Auth:

auth.users.id (UUID) = identidade primária.

Campos principais: email, created_at, last_sign_in_at.

A tabela users do schema Kroova é um espelho enriquecido:

users.id (uuid PK) → corresponde 1:1 a auth.users.id.

Campos adicionais: display_id, cpf, etc.

Regra de sincronização

Ao registrar um novo usuário:

Cria registro em auth.users (Supabase Auth).

Cria registro em users com:

id = mesmo UUID de auth.users

display_id = algo como usr_a921fe (prefix + 6 chars)

cpf = null inicialmente

Cria wallet com saldos zerados.

🔑 Autenticação (Login / Token)
Provedor de Auth

Utilizar Supabase Auth com:

E-mail + senha (primeiro momento)

Futuro: opcional social login (Google/Apple) se desejado.

Token

Supabase gera JWT próprio (access token) com:

sub = user id (UUID)

email = e-mail do usuário

Claims adicionais podem ser adicionadas via hooks/edge functions (ex: role).

O backend Node.js:

Recebe tokens no header:
Authorization: Bearer <jwt>

Valida o token usando a JWT_SECRET ou JWKS do Supabase.

Extrai:

user_id

email

Opcionalmente role

Expiração

Tokens de acesso:

Curto prazo (ex.: 60 min).

Refresh token:

Gerenciado pelo próprio Supabase Auth (não pelo backend custom).

O frontend deve:

Renovar token via supabase.auth.refreshSession() (ou equivalente).

👤 Perfil & CPF
Campos de perfil em users

id (uuid) – chave primária.

email (text) – espelho do Supabase.

name (text) – nome público.

cpf (text | null) – CPF bruto ou formatado.

cpf_verified (boolean) – pode ser derivado ou armazenado (opcional).

created_at (timestamp).

Quando CPF é obrigatório?

CPF NÃO é obrigatório para:

Criar conta

Fazer login

Comprar boosters com saldo já carregado

Jogar / colecionar

CPF É obrigatório para:

Sacar valores (PIX ou outra forma regulada)

Receber dinheiro de reciclagem convertida em BRL (se for saque)

Receber valores de venda em marketplace via BRL

Qualquer operação que mexa com dinheiro real para fora da plataforma

Fluxo recomendando (UX)

Usuário cria conta apenas com email + senha.

Começa a comprar boosters, receber itens, reciclar, etc.

Quando tenta:

Sacar via PIX

Ou receber saldo em BRL por venda/reciclagem

A API retorna erro:

Código exemplo: NEEDS_CPF

Mensagem: “Para sacar ou ganhar em dinheiro real, finalize seu cadastro com CPF.”

Usuário chama rota POST /api/v1/users/cpf e completa CPF.

Backend pode:

Validar formato.

Opcional: integrar com serviço de verificação (Serasa/Receita ou outro).

🧱 Perfis de Permissão (Roles)
Roles básicos

user → usuário normal (default)

admin → operador/administrador da plataforma

system → uso interno (jobs, queues, webhooks altamente privilegiados)

user

Pode:

Acessar o próprio inventário

Comprar boosters

Reciclar cartas próprias

Vender e comprar no marketplace

Solicitar saques (com CPF configurado)

Não pode:

Acessar dados de outros usuários

Alterar saldo “na mão”

Ver auditorias internas

admin

Pode:

Tudo que user pode

Ler dados de qualquer usuário (necessário por motivos de suporte/contabilidade)

Rodar auditorias

Ver relatórios agregados

Não pode:

Ver chaves privadas em claro (chaves são sempre criptografadas)

Desviar fundos sem registro em transactions (qualquer movimentação precisa passar por lógica auditável)

system

Não é um “usuário humano”.

Representa:

Webhooks de pagamento

Jobs de mint on-chain

Jobs de auditoria

A autenticação do system é feita via:

Secret interno (API Key)

IP allowlist (opcional)

Nunca via JWT de usuário.

🛡️ Proteção de Rotas (Visão Funcional)
Rotas Públicas (sem token)

Registro: /api/v1/auth/register

Login: /api/v1/auth/login

Listagem geral de boosters: /api/v1/boosters

Landing pages (fora de /api/v1)

Rotas Protegidas (Bearer JWT)

Qualquer rota com 🔒 nas specs:

/api/v1/auth/me

/api/v1/wallet/\*

/api/v1/inventory

/api/v1/cards/\*

/api/v1/market/\*

/api/v1/pending/claim

/api/v1/cards/:instance_id/recycle

/api/v1/cards/:instance_id/mint

A regra geral:

Se mexe com dados pessoais, inventário, saldo ou NFTs, precisa de user_id autenticado.

Rotas Administrativas

/api/v1/admin/\* → só admin ou system.

A autorização:

Pode ser baseada em claim de role no JWT (role: admin)

Ou em tabela user_roles vinculada a users.

🚨 Antifraude & Multi-conta (Visão Base)

Este documento define apenas diretrizes iniciais, não uma engine completa de antifraude.

Objetivos

Evitar:

Exploração de reciclagem abusiva (loop infinito de lucro)

Criação de múltiplas contas para abusar de bônus

Saques em CPF de terceiros (laranjas)

Medidas mínimas

Vincular CPF a apenas 1 conta principal

Política recomendada:

Um CPF pode ser vinculado a no máximo 1 conta ativa.

Em caso de tentativa de vincular CPF já usado:

Retornar erro: CPF_ALREADY_IN_USE.

Limites de saque por período

Exemplo:

Limite diário/semana/mês por CPF e por conta.

Regra funcional:

Definir withdraw_limit_daily_brl (valor configurável no sistema).

Antes de aprovar saque, somar tudo sacado no período.

Monitorar reciclagem em massa

Regra simples:

Registrar número diário de reciclagens por conta.

Se ultrapassar limiar (ex: 1000 cartas/dia), marcar para revisão manual ou retardar saques.

IP + Device (opcional)

Para futuro: guardar hash de device/IP para detectar padrões suspeitos (não obrigatório neste momento).

💸 Regras de Depósito e Saque (Resumo Funcional)
Depósito

Pode ser feito:

Via PIX (chave/E2E no provedor)

Via cartão (Stripe ou outro)

O comprovante vem por webhook:

Rota: /api/v1/wallet/deposit/webhook

Identifica usuário via metadata do pagamento:

user_id ou

email ou

pending_inventory se não há conta

Não requer CPF para depósito (somente para saque).

Saque

Sempre:

Requer usuário autenticado.

Requer CPF cadastrado e válido no usuário.

Requer saldo suficiente.

Aplica taxa de 4%:

valor_saque_liquido = valor_solicitado \* (1 - 0.04)

Para PIX:

O CPF do titular do PIX deve ser o mesmo do campo cpf do usuário.

Isso deve ser verificado:

Ou via integração com o provedor

Ou explícito no fluxo (o usuário declara que o PIX é dele).

Para cripto:

Não requer CPF, mas:

A plataforma pode configurar limites extras ou KYC avançado em volumes maiores.

🧾 JWT: Claims Mínimas (Sugestão)

Claims que podem ser úteis no token (além do padrão Supabase):

sub → user_id

email → e-mail do usuário

role → "user" | "admin"

(Opcional) is_cpf_set → boolean

Facilita no frontend checar se o usuário já completou CPF.

Esses claims podem ser:

Derivados via RLS (Row Level Security) no Supabase

Ou adicionados em fluxo próprio no backend.

🧱 Integração com Supabase (Visão Simples)

Frontend:

Usa SDK do Supabase para:

signUp (register)

signInWithPassword (login)

Recebe session com JWT (access token).

Usa este JWT para chamar /api/v1/\*.

Backend:

Valida token usando dados do Supabase (chave pública ou secret).

Usa sub como user_id.

Confere existência em users antes de qualquer operação.

Banco:

users.id = auth.users.id

wallets.user_id = users.id etc. (como definido no KROUVA_DB_SCHEMA.md; legacy: KROOVA_DB_SCHEMA.md).

🔒 Segurança Básica das Rotas

Toda rota 🔒:

Deve recusar acesso se:

Não houver header Authorization

Token inválido/expirado

Deve sempre usar o user_id vindo do token para:

Buscar wallet

Buscar inventário

Criar transações

Nunca:

Confiar em user_id vindo do body/query (sempre ignorar e pegar do token).

🏁 Conclusão

Este arquivo define as regras centrais de autenticação e identidade do sistema Kroova:

Supabase Auth como base

users como espelho enriquecido

CPF apenas quando mexer com dinheiro real

Roles (user, admin, system)

Antifraude simples, porém funcional

Regras claras para depósito, saque e proteção de rotas

Com KROUVA_AUTH_RULES.md + KROUVA_API_ROUTES.md + KROUVA_DB_SCHEMA.md, o Copilot já tem contexto suficiente para:

Implementar middlewares de auth

Conectar Supabase Auth com o backend Node

Garantir que apenas usuários válidos movimentem saldo e NFTs.

======== FIM DO ARQUIVO ========
