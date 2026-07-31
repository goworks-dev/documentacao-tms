---
sidebar_position: 3
title: Produtos
---

# Retorno por produto (`produtos`)

Um mesmo documento pode ser processado em **vários produtos** contratados pelo emitente. Cada produto é avaliado de forma independente: um pode ser averbado e outro recusado.

O bloco `produtos` é um mapa cuja chave é o nome do produto:

```json
{
  "message": "…",
  "produtos": {
    "TRANSPORTE": { "success": true,  "statusCode": 201, "message": "…", "data": { "endorsement": { … } } },
    "RCV":        { "success": true,  "statusCode": 202, "message": "…", "data": { … } }
  }
}
```

## Produtos existentes

| Chave | Produto |
|---|---|
| `TRANSPORTE` | Seguro de transporte — é o produto que gera o **ANTT** |
| `RCV` | Responsabilidade Civil de Veículos (RC-V) — dados de viagem e veículos vêm do MDF-e ou das [tags do RC-V](../enviar-xml/rcv.md) |
| `TRANSMISSAO` | Transmissão do documento a terceiros |

:::info A lista pode crescer
Novos produtos podem ser adicionados. Trate `produtos` como um mapa dinâmico — percorra as chaves em vez de ler `produtos.TRANSPORTE` e `produtos.RCV` de forma fixa.
:::

## Campos de cada produto

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `success` | boolean | sim | **Resultado do produto.** É o campo que deve governar a lógica do TMS |
| `statusCode` | number | sim | Código detalhado do processamento daquele produto (ver tabela abaixo) |
| `message` | string | sim | Texto descritivo, geralmente com o sufixo `- Cliente: … - Parceiro: … - Emitente: …` |
| `error` | string | não | Código do erro, quando `success: false`. Também aparece em alguns sucessos informativos (ex.: `DOCUMENTO_DUPLICADO`) |
| `data` | objeto/array | não | Dados do processamento. Formato varia por produto e operação |

## Códigos observados em `statusCode`

| Código | Significado |
|---|---|
| `200` | Processado — documento ou evento já conhecido/atualizado |
| `201` | Averbado — registro criado |
| `202` | Aceito e em processamento (RC-V pendente de conclusão) |
| `404` | Recurso não encontrado (ex.: apólice inexistente) |
| `422` | Regra de negócio impediu a averbação (prazo, tipo de documento não autorizado) |
| `500` | Falha no processamento |

:::caution `statusCode` é do produto, não da requisição
Esse código é interno ao produto e **não** corresponde ao status HTTP da resposta. É comum receber HTTP 2xx com um produto em `statusCode: 500`.
:::

## Conteúdo de `data` por produto

### `TRANSPORTE`

| Operação | `data` |
|---|---|
| Averbação de CT-e / NF-e / Outros | `{ "endorsement": { … } }` — ver [Averbação](./averbacao.md) |
| Averbação de MDF-e | `{ "mdfe": { … } }` — ver [MDF-e](./mdfe.md) |
| Cancelamento de CT-e / NF-e | `{ "event": [ { … } ] }` — ver [Eventos](./eventos.md) |
| Cancelamento / encerramento de MDF-e | `{ "event_mdfe": { … }, "des_endereco_xml": "…" }` |

### `RCV`

Averbação:

```json
{
  "success": true,
  "statusCode": 202,
  "message": "Documento RC-V processado",
  "data": {
    "processed": true,
    "pending": true,
    "documento": { "id_documento": "19295343-e2a7-4fce-b1a3-c27795aa8f54" },
    "policy": {
      "id_apolice": "b8c0ef17-35d5-45de-a6a2-3f37dcb67fd6",
      "cod_apolice": "221748",
      "cod_susep": 59,
      "des_ramo": "Responsabilidade Civil de Veículos",
      "documento_tipo": "CTE",
      "vigencia": {
        "inicio": "2026-01-01T23:59:59.999-03:00",
        "fim": "2028-01-01T23:59:59.999-03:00"
      }
    }
  }
}
```

| Campo | Descrição |
|---|---|
| `processed` | Documento processado no RC-V |
| `pending` | `true` indica conclusão assíncrona pendente |
| `documento.id_documento` | Identificador do documento no RC-V |
| `policy.cod_apolice` | Apólice utilizada |
| `policy.cod_susep` | Código SUSEP |
| `policy.des_ramo` | Ramo (ex.: "Responsabilidade Civil de Veículos") |
| `policy.documento_tipo` | Tipo de documento aceito pela apólice |
| `policy.vigencia.inicio` / `fim` | Vigência da apólice |

Cancelamento: `data` vem como **array** de eventos, sem envelope `event`.

Evento já processado antes: `data` vem como `{}`.

## Consolidação

```text
sucessos = produtos com success == true
falhas   = produtos com success == false

sucessos > 0 e falhas > 0  → SUCESSO PARCIAL   (documento averbado em parte)
sucessos > 0 e falhas == 0 → AVERBADO
sucessos == 0              → FALHA
```

:::caution `produtos` vazio
Já foi observado o retorno `{"message": "Emitente sem meio de averbação habilitado para os produtos do documento", "produtos": {}}`. Um mapa vazio **não** significa sucesso — significa que nada foi processado. Trate `produtos` vazio como falha e exiba a `message` ao usuário.
:::

## Exemplo — falha parcial

```json
{
  "message": "Falha ao criar registro de Veículo",
  "produtos": {
    "TRANSPORTE": {
      "success": false,
      "statusCode": 500,
      "message": "Falha ao criar registro de Veículo",
      "error": "MDFE_PROCESSING_ERROR"
    },
    "RCV": {
      "success": true,
      "statusCode": 202,
      "message": "Documento RC-V processado",
      "data": { "processed": true, "pending": true }
    }
  }
}
```

Resultado: **sucesso parcial** — o RC-V foi processado, o Transporte não. O documento precisa ser reenviado após a correção, ou tratado manualmente.

## Exemplo — reenvio de documento já averbado

```json
{
  "produtos": {
    "TRANSPORTE": { "success": true, "statusCode": 200, "error": "DOCUMENTO_DUPLICADO", "message": "…" },
    "RCV":        { "success": true, "statusCode": 200, "error": "DOCUMENTO_DUPLICADO", "message": "…" }
  }
}
```

:::info Duplicidade não é erro
`DOCUMENTO_DUPLICADO` vem com `success: true`: o documento **já estava averbado**. O reenvio é idempotente e não gera nova averbação — trate como sucesso.
:::
