---
sidebar_position: 7
title: Erros
---

# Erros

## Códigos HTTP

| HTTP | Significado | Ação recomendada |
|---|---|---|
| `200` / `201` / `202` | Processado — **verifique o corpo**, pode haver falha por produto | Consolidar produtos |
| `400` | Requisição malformada (XML inválido, header ausente) | Corrigir — não reenviar igual |
| `401` | Chave inválida, desativada ou emitente inativo | Parar a fila do cliente e avisar o usuário |
| `404` | Recurso não encontrado (ex.: apólice inexistente) | Não reenviar sem correção |
| `422` | Regra de negócio impediu a averbação | Não reenviar sem correção |
| `500` | Falha no processamento | Reenviar com backoff |
| `503` / `504` | Serviço indisponível ou lento | Reenviar com backoff |

:::caution HTTP 2xx não significa "averbado"
Um documento pode voltar com HTTP 200 e conter produtos com `success: false`, ou um `produtos` vazio. Sempre inspecione o corpo.
:::

## Formatos de corpo em erro

A API usa quatro formatos. Implemente a leitura na ordem abaixo.

### 1. Somente `message`

```json
{ "message": "Data de Embarque deve ser maior ou igual à Data de Emissão." }
```

### 2. `message` + `error` (texto)

```json
{
  "message": "Documento ja existe na base de dados. Chave do documento: 3522…",
  "error": "Documento ja existe na base de dados. Chave do documento: 3522…"
}
```

### 3. `message` + `event` com validações

```json
{
  "message": "Usuário inativo ou não encontrado",
  "event": {
    "errors": [
      {
        "field": "User",
        "message": "Usuário inativo ou não encontrado",
        "rule": "USUARIO_INATIVO_OU_NAO_ENCONTRADO",
        "context": {}
      }
    ],
    "errorCount": 1,
    "stage": "validation",
    "rule": "USUARIO_INATIVO_OU_NAO_ENCONTRADO",
    "businessRuleViolation": true
  }
}
```

| Campo | Descrição |
|---|---|
| `event.errors[].field` | Campo/entidade que falhou |
| `event.errors[].message` | Descrição do problema |
| `event.errors[].rule` | **Código da regra violada** — use este valor na lógica |
| `event.errorCount` | Quantidade de erros |
| `event.stage` | Etapa (ex.: `validation`) |
| `event.businessRuleViolation` | `true` quando é regra de negócio (não adianta reenviar) |

### 4. `message` + `produtos` com o detalhe por produto

```json
{
  "message": "TRANSPORTE: ERRO - O Prazo para averbação foi ultrapassado. Prazo de Averbação: Horas após Emissão | RCV: ERRO - Nenhuma apolice RCV vigente encontrada",
  "produtos": {
    "TRANSPORTE": {
      "success": false,
      "statusCode": 422,
      "message": "O Prazo para averbação foi ultrapassado. Prazo de Averbação: Horas após Emissão",
      "data": null,
      "error": "AVERBACAO_RECUSADA"
    },
    "RCV": {
      "success": false,
      "statusCode": 404,
      "message": "Nenhuma apolice RCV vigente encontrada",
      "error": "APOLICE_NAO_ENCONTRADA"
    }
  }
}
```

:::tip Leia o `produtos` também nas falhas
Mesmo em resposta de erro, `produtos` pode trazer o motivo **de cada produto**. Guardar apenas a `message` do topo perde essa informação — que é justamente a que o usuário precisa para corrigir.
:::

## Leitura recomendada da mensagem

```text
mensagem =  produtos[*].message   (quando houver, uma por produto)
         ou event.errors[*].message
         ou error
         ou message
         ou "Falha na comunicação com o AverbGo"
```

## Códigos de `error` conhecidos

| Código | Ocorre quando | Reenviar resolve? |
|---|---|---|
| `AVERBACAO_RECUSADA` | Regra da apólice impediu a averbação (prazo ultrapassado, limite extrapolado) | Não — corrigir a origem |
| `APOLICE_NAO_ENCONTRADA` | Não há apólice vigente para o produto/emitente | Não — verificar contratação |
| `DOCUMENTO_DUPLICADO` | Documento já processado. Vem com `success: true` | Não é erro |
| `MDFE_PROCESSING_ERROR` | Falha ao processar dados do MDF-e (ex.: registro de veículo) | Às vezes — corrigir dados |
| `EVENT_PROCESSING_ERROR` | Falha ao processar o evento (documento não pertence ao emitente, viagem inexistente) | Não — verificar o documento original |
| `USUARIO_INATIVO_OU_NAO_ENCONTRADO` | Chave de emitente inativo | Não — regularizar no portal |

## Mensagens frequentes

| Mensagem | Causa provável |
|---|---|
| `Data de Embarque deve ser maior ou igual à Data de Emissão.` | Tag extra `embarque` anterior à emissão do documento |
| `O Prazo para averbação foi ultrapassado. Prazo de Averbação: …` | Envio fora do prazo da apólice |
| `Documento ja existe na base de dados. Chave do documento: …` | Reenvio de documento já averbado |
| `Emitente sem meio de averbação habilitado para os produtos do documento` | Emitente sem produto habilitado |
| `Nenhuma apolice RCV vigente encontrada` | RC-V sem apólice vigente |
| `Tipo de documento 'CTE' não autorizado para apólice RCV. Tipos permitidos: …` | Documento fora dos tipos aceitos pela apólice |
| `O documento não pertence ao emitente` | Evento enviado com chave de outro emitente |
| `Usuário inativo ou não encontrado` | Chave revogada ou emitente inativo |

## O que reenviar

| Classe | Exemplos | Política |
|---|---|---|
| **Transitório** | `500`, `503`, `504`, timeout, falha de rede | Reenviar com backoff exponencial (ex.: 1 min, 5 min, 15 min, máx. 5 tentativas) |
| **Permanente** | `400`, `401`, `404`, `422`, `businessRuleViolation: true` | Não reenviar automaticamente — exige correção ou ação do usuário |
| **Idempotente** | `DOCUMENTO_DUPLICADO`, evento já processado | Reenvio é seguro e não duplica averbação |

:::caution Não faça retentativa infinita
Documentos com recusa de regra de negócio não mudam de resultado por repetição. Reenvio em laço só gera carga e atrasa os documentos válidos da fila.
:::
