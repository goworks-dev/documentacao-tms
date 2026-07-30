---
sidebar_position: 6
title: Eventos
---

# Eventos (`event` e `event_mdfe`)

Eventos são operações sobre um documento **já enviado**: cancelamento de CT-e, NF-e e Outros, e cancelamento ou encerramento de MDF-e.

A API usa **dois blocos diferentes**, com estruturas bastante distintas:

| Documento do evento | Bloco | Formato |
|---|---|---|
| CT-e, NF-e, Outros | `event` | **array** de eventos, com os campos já normalizados |
| MDF-e | `event_mdfe` | **objeto** que encapsula o XML do evento convertido |

:::caution Trate os dois separadamente
Não escreva um único parser para "evento". Verifique primeiro qual bloco veio e leia os campos correspondentes.
:::

---

## Cancelamento de CT-e / NF-e / Outros (`event`)

```json
{
  "message": "Evento de cancelamento processado com sucesso",
  "event": [
    {
      "id_documento_cancelado": "6818e4e8-a392-42f9-ba02-013cc7ed2dd7",
      "id_documento_afetado": "25fabdaf-236f-42b7-97cd-dd8b420fda95",
      "chave_documento": "53220834274233001257550000018220451121035004",
      "tipo_evento": "110111",
      "num_protocolo": "143140038502164",
      "data_envio": "2026-07-16",
      "hora_envio": "16:42:42",
      "data_cancelamento_sefaz": "2023-11-03",
      "hora_cancelamento_sefaz": "17:31:28",
      "tip_status": 1,
      "des_tipo_status": "Ativo",
      "cod_documento_emitente": "33183658000135",
      "nom_razao_social_emitente": "NR PARTICIPACOES LTDA",
      "cod_documento_relacionamento": "33183658000135",
      "nom_razao_social_relacionamento": "NR PARTICIPACOES LTDA",
      "cod_documento_parceiro": "61074175000138",
      "nom_razao_social_parceiro": "MAPFRE SEGUROS GERAIS S.A.",
      "cod_documento_cliente": "03724425000131",
      "nom_razao_social_cliente": "GPS CORRETAGENS DE SEGUROS LTDA",
      "xml_evento": "<procEventoCTe versao=\"3.00\" …>"
    }
  ]
}
```

### Campos

| Campo | Tipo | Descrição |
|---|---|---|
| `id_documento_cancelado` | string (UUID) | **Identificador do evento de cancelamento registrado** |
| `id_documento_afetado` | string (UUID) | Identificador da averbação que foi cancelada |
| `chave_documento` | string (44) | Chave de acesso do documento cancelado |
| `tipo_evento` | string \| number | `110111` = cancelamento |
| `num_protocolo` | string | Protocolo do evento na SEFAZ |
| `data_envio` / `hora_envio` | string | Data e hora do processamento no AverbGo |
| `data_cancelamento_sefaz` / `hora_cancelamento_sefaz` | string | Data e hora do cancelamento na SEFAZ |
| `tip_status` / `des_tipo_status` | number/string | Situação do registro do evento |
| `cod_documento_*` / `nom_razao_social_*` | string | Emitente, relacionamento, parceiro e cliente |
| `xml_evento` | string | Eco do XML do evento enviado |

:::caution `event` é um array
Mesmo com um único evento, o bloco vem como lista. Percorra o array — não leia `event.id_documento_cancelado` diretamente.
:::

:::caution `event` também aparece em erros — como objeto
Em respostas de erro, a chave `event` pode conter um **objeto** de validação (`{ "errors": [...], "errorCount": 1, "stage": "validation", … }`), e não a lista de eventos processados. Confirme o HTTP e verifique `Array.isArray(event)` antes de ler. Ver [Erros](./erros.md).
:::

---

## Cancelamento e encerramento de MDF-e (`event_mdfe`)

```json
{
  "event_mdfe": {
    "produto": "TRANSPORTE",
    "averbacaoMeio": 2,
    "id_pessoa_emitente": "…",
    "cod_usuario": "NR PARTICIPACOES",
    "proceventomdfe": {
      "eventomdfe": {
        "infevento": {
          "cnpj": "33183658000135",
          "chmdfe": "53220834274233001257550000018220451121035007",
          "dhevento": "2022-07-05T15:09:05-04:00",
          "tpevento": "110111",
          "nseqevento": "1",
          "detevento": {
            "evcancmdfe": {
              "descevento": "Cancelamento",
              "nprot": "950220004478454",
              "xjust": "feito para teste"
            }
          }
        }
      },
      "reteventomdfe": { "…": "retorno da SEFAZ" }
    }
  },
  "des_endereco_xml": "event-dfe-f48be3b0-0197-4844-b434-65b422efa9a6"
}
```

### Campos

| Campo | Descrição |
|---|---|
| `produto` | Produto que processou o evento (ex.: `TRANSPORTE`) |
| `averbacaoMeio` | Meio de averbação utilizado |
| `id_pessoa_emitente` | Emitente no AverbGo |
| `cod_usuario` | Identificação do emitente |
| `proceventomdfe.eventomdfe.infevento.chmdfe` | Chave do MDF-e afetado |
| `proceventomdfe.eventomdfe.infevento.tpevento` | **`110111` cancelamento · `110112` encerramento** |
| `proceventomdfe.eventomdfe.infevento.dhevento` | Data/hora do evento |
| `proceventomdfe.eventomdfe.infevento.nseqevento` | Sequência do evento |
| `…detevento.evcancmdfe.nprot` | Protocolo do cancelamento |
| `…detevento.evcancmdfe.xjust` | Justificativa do cancelamento |
| `…detevento.evencmdfe.nprot` | Protocolo do encerramento |
| `…detevento.evencmdfe.dtenc` | Data do encerramento |
| `…detevento.evencmdfe.cuf` / `cmun` | UF e município do encerramento |
| `proceventomdfe.reteventomdfe` | Retorno da SEFAZ, conforme o layout oficial |
| `des_endereco_xml` | Referência interna do XML armazenado (fica **fora** de `event_mdfe`) |

:::caution Estrutura espelha o XML da SEFAZ
Diferente do bloco `event`, aqui os dados **não são normalizados**: o conteúdo é o próprio evento MDF-e convertido de XML para JSON, com as tags em minúsculas (`infevento`, `tpevento`, `detevento`). Campos como `data_envio`, `hora_envio`, `id_documento_cancelamento` ou `tipo_evento` **não existem** neste bloco — o tipo do evento está em `proceventomdfe.eventomdfe.infevento.tpevento`.
:::

### Distinguir cancelamento de encerramento

```text
tpevento == "110111"  → Cancelamento de MDF-e
tpevento == "110112"  → Encerramento de MDF-e
```

O bloco de detalhe também muda: `evcancmdfe` para cancelamento e `evencmdfe` para encerramento.

---

## Pré-requisito

O documento original precisa ter sido enviado e processado antes do evento. Cancelamentos de documentos desconhecidos são recusados com `EVENT_PROCESSING_ERROR` e mensagens como *"O documento não pertence ao emitente"*.

## Evento repetido

Reenviar um evento já processado devolve `success: true` com mensagem *"Evento de Cancelamento já processado anteriormente"* e `data` vazio (`{}`). É idempotente — trate como sucesso.
