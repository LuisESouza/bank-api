# Bank API

A **Bank API** é uma API para gerenciamento de contas bancárias, permitindo que os usuários criem contas, façam login, consultem saldo e realizem transações como transferências e depósitos. A API utiliza autenticação JWT para garantir a segurança das operações.

## Tecnologias Utilizadas

- **Node.js**
- **Express.js**
- **Prisma**
- **bcryptjs**
- **jsonwebtoken**
- **CORS**
- **dotenv**
- **PostgreSQL**

---

## Como Funciona

Na **Bank API**, existem dois tipos de usuários: **comum** e **lojista**. 

- **Usuários Comuns**: Podem tanto **transferir** dinheiro para outros usuários quanto **receber** transferências de outros usuários. Ou seja, eles têm total liberdade para realizar transações para qualquer tipo de conta.

- **Usuários Lojistas**: Podem **somente receber** dinheiro de **usuários comuns**. Eles não podem transferir dinheiro para outras contas, apenas receber pagamentos de usuários comuns.

A API garante que as permissões sejam respeitadas através de autenticação JWT, controlando o tipo de usuário e suas permissões ao longo das transações.

---

## Funcionalidades

- **Criação de Usuário**: Permite o cadastro de novos usuários.
- **Login de Usuário**: Permite que o usuário faça login utilizando email e senha.
- **Consulta de Saldo**: O usuário pode visualizar o saldo disponível em sua conta.
- **Transações Bancárias**: Permite transferências e depósitos entre contas.
- **Autenticação**: Protege rotas com autenticação JWT para garantir que apenas usuários autenticados possam interagir com suas contas.

---

## Rodando a API Localmente

A API não está hospedada e precisa ser executada localmente. Siga os passos abaixo para rodar a API:

1. Clone o repositório para sua máquina local:
    ```bash
    git clone https://github.com/LuisESouza/bank-api.git
    ```

2. Entre no diretório do projeto:
    ```bash
    cd bank-api
    ```

3. Instale as dependências do projeto:
    ```bash
    npm install
    ```

4. Crie um arquivo `.env` na raiz do projeto e adicione as configurações necessárias, como as credenciais do banco de dados e a chave secreta do JWT.

5. Rode a API em modo de desenvolvimento:
    ```bash
    npm run dev
    ```

Agora a API estará disponível localmente, e você poderá fazer requisições para o endereço `http://localhost:3000`.

---

### Exemplos de Requisições:

#### Criar um novo usuário

**Endpoint:** `POST /api/user/register`

**Request Body:**
```json
{
  "nome": "Luis",
	"email": "Luis@exemplo.com",
	"password": "senha123",
	"cpf": "00000000000",
	"type_user": "comum ou lojista"
}
```

**Response:**
```json
{
  "token": "SEU_TOKEN_JWT"
}
```

#### Fazer login

**Endpoint:** `POST /api/user/login`

**Request Body:**
```json
{
  "login": "email ou cpf",
  "password": "senha123"
}
```

**Response:**
```json
{
  "token": "SEU_TOKEN_JWT"
}
```

#### Consultar carteira

**Endpoint:** `GET /api/user/wallet/:user_id`

**Response:**
```json
{
  "id": 3,
  "user_id": 11,
  "saldo": "11480.94",
	"updated_at": "2025-03-26T15:55:26.655Z"
}
```

### Realizar transferência (Requer autenticação)

**Endpoint:** `POST /api/transactions/transfer`

**Headers:**
```json
{
  "Authorization": "Bearer SEU_TOKEN_JWT"
}
```

**Request Body:**
```json
{
  "payee": "2",
  "value": 100.00
}
```

**Response:**
```json
{
  "message": "Transferência realizada com sucesso!"
}
```

### Realizar depósito (Requer autenticação)

**Endpoint:** `PUT /api/transactions/deposit`

**Headers:**
```json
{
  "Authorization": "Bearer SEU_TOKEN_JWT"
}
```

**Request Body:**
```json
{
  "saldo": 200.00
}
```

**Response:**
```json
{
  "message": "Depósito realizado com sucesso!"
}
```

---

### Importante
- Todas as requisições protegidas exigem um token JWT, que deve ser incluído no cabeçalho `Authorization`.
- Para testar a API, você pode usar ferramentas como **Postman**, **Insomnia** ou realizar requisições via **cURL**.

## Middleware de Autenticação

As rotas que manipulam contas bancárias são protegidas pelo middleware de autenticação. A autenticação é feita via JWT, e o token gerado no login deve ser enviado no cabeçalho `Authorization` das requisições.
