---
sidebar_position: 3
title: Autenticação
---

# Autenticação

Toda requisição é autenticada por uma **chave de acesso** (`SECRET_KEY`) enviada no header `Authorization`.

```text
Authorization: SECRET_KEY
```

:::info Sem `Bearer`
A chave vai **pura** no header, sem o prefixo `Bearer` e sem aspas.
:::

## Onde obter a chave

O próprio segurado gera a chave no portal AverbGo, em **[https://averbgo.com.br/main/chaves](https://averbgo.com.br/main/chaves)**.

Cada chave está vinculada a um emitente. Um TMS que atende vários embarcadores deve armazenar **uma chave por cliente** e usar a chave correta em cada envio — é a chave que identifica de quem é o documento.

:::caution Tratamento da chave
- Nunca versione a chave no código-fonte nem a exponha no front-end.
- Armazene-a criptografada, com acesso restrito.
- Em caso de suspeita de vazamento, gere uma nova no portal e desative a anterior.
:::

## Validar e ativar uma chave

Antes do primeiro envio, o TMS pode validar a chave e recuperar os dados do emitente.

### Consultar

```text
GET /acess_key/verify/{KEY}
```

### Ativar

```text
PUT /acess_key/active/{KEY}
```

**Resposta (ambas as rotas):**

```json
{
  "id_chave_acesso": "41e1162b-0977-4810-bb33-d1e1a9087977",
  "nom_razao_social": "SUGGEST ONE",
  "cod_documento_pessoa": "32004241000103",
  "nom_fantasia_emitente": "SUGGEST ONE CONSULTORIA LTDA"
}
```

| Campo | Descrição |
|---|---|
| `id_chave_acesso` | Identificador interno da chave |
| `nom_razao_social` | Razão social do emitente vinculado |
| `cod_documento_pessoa` | CNPJ do emitente (somente números) |
| `nom_fantasia_emitente` | Nome fantasia do emitente |

Use esses dados para confirmar, na tela de configuração do TMS, que a chave informada pertence ao cliente correto.

## Chave inválida ou desativada

Uma chave revogada, expirada ou de emitente inativo faz a API responder **HTTP 401**.

:::caution Pare o envio no 401
`401` não é erro transitório: reenviar não resolve. O comportamento recomendado é **interromper a fila daquele cliente**, sinalizar a situação ao usuário e orientá-lo a verificar a chave no portal AverbGo. Continuar tentando apenas acumula documentos em erro.
:::
