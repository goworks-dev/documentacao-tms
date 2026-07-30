---
sidebar_position: 2
title: Multi-hierarquia
---

# Retorno multi-hierarquia (`emitentes`)

Um mesmo emitente pode estar vinculado a **mais de uma hierarquia** — combinações distintas de cliente e parceiro (seguradora), cada uma com suas próprias apólices e produtos. Quando isso acontece, um único envio, com **uma única chave de acesso**, é processado em todas as hierarquias e a API responde com o array **`emitentes`**.

Cada item do array é **uma hierarquia**, não um emitente diferente: repare que o campo `emitente` costuma repetir o mesmo nome em todos os itens, variando `cliente` e `parceiro`.

:::info Verifique este bloco primeiro
`emitentes` tem precedência sobre todos os demais. Se ele existir, os dados de averbação estão **dentro** dele — não procure `endorsement` na raiz.
:::

## Estrutura

```json
{
  "message": "2 emitente(s) processado(s) com sucesso",
  "emitentes": [
    {
      "idPessoaEmitente": "f6133655-d982-4337-a7ad-51ac18c9c170",
      "emitente": "NR PARTICIPACOES",
      "cliente": "GPS-PAMCARY",
      "parceiro": "MAPFRE",
      "produtos": {
        "TRANSPORTE": {
          "success": true,
          "statusCode": 201,
          "message": "Processo de Averbação concluído com sucesso! - Cliente: GPS-PAMCARY - Parceiro: MAPFRE - Emitente: NR PARTICIPACOES",
          "data": {
            "endorsement": { "…": "ver capítulo Averbação" }
          }
        }
      }
    },
    {
      "idPessoaEmitente": "…",
      "emitente": "NR PARTICIPACOES",
      "cliente": "DATASYSTEM - RCV",
      "parceiro": "DATASYSTEM",
      "produtos": {
        "RCV": {
          "success": true,
          "statusCode": 202,
          "message": "Documento RC-V processado - Cliente: DATASYSTEM - RCV - Parceiro: DATASYSTEM - Emitente: NR PARTICIPACOES",
          "data": { "processed": true, "pending": true, "…": "…" }
        }
      }
    }
  ]
}
```

No exemplo acima é **o mesmo emitente** (`NR PARTICIPACOES`) em duas hierarquias: uma com o cliente GPS-PAMCARY e a seguradora MAPFRE, outra com o cliente e parceiro DATASYSTEM. Cada hierarquia processou o produto que lhe cabe.

## Campos de cada hierarquia

| Campo | Tipo | Descrição |
|---|---|---|
| `idPessoaEmitente` | string (UUID) | Identificador do emitente no AverbGo naquela hierarquia |
| `emitente` | string | Nome do emitente |
| `cliente` | string | Cliente (segurado) da hierarquia |
| `parceiro` | string | Parceiro/seguradora da hierarquia |
| `produtos` | objeto | Mapa `NOME_DO_PRODUTO` → resultado. Ver [Produtos](./produtos.md) |

:::tip Use os campos estruturados
`emitente`, `cliente` e `parceiro` já vêm prontos e identificam a hierarquia. Não é necessário extrair esses nomes do texto da `message` — que também os repete, mas em formato livre.
:::

:::caution A `message` do topo fala em "emitentes"
A mensagem de resumo usa a redação `"2 emitente(s) processado(s) com sucesso"`, contando **hierarquias**, não emitentes distintos. É texto de exibição — a contagem confiável é `emitentes.length`.
:::

## Consolidação do resultado

Percorra **todos os produtos de todas as hierarquias**:

```text
sucessos = produtos com success == true
falhas   = produtos com success == false

sucessos > 0 e falhas > 0  → SUCESSO PARCIAL
sucessos > 0 e falhas == 0 → AVERBADO
sucessos == 0              → FALHA
```

Exemplo de resposta com falha parcial:

```json
{
  "message": "[NR PARTICIPACOES] TRANSPORTE: Evento de cancelamento processado com sucesso | [NR PARTICIPACOES] RCV: ERRO - O documento não pertence ao emitente",
  "emitentes": [
    { "produtos": { "TRANSPORTE": { "success": true, "statusCode": 200, "data": { "event": [ … ] } } } },
    { "produtos": { "RCV": { "success": false, "statusCode": 500,
                             "error": "EVENT_PROCESSING_ERROR",
                             "message": "O documento não pertence ao emitente - Cliente: …" } } }
  ]
}
```

:::caution Formato da `message` em falha parcial
Repare no prefixo `[EMITENTE] PRODUTO:` e no marcador `ERRO -`. É um resumo textual para exibição — a informação confiável está em `emitentes[].produtos[].success`.
:::

## O ANTT vem por hierarquia

Cada hierarquia tem a **sua** apólice e, portanto, o seu número de averbação:

```text
emitentes[i].produtos.TRANSPORTE.data.endorsement.antts[j].antt
```

:::caution Não leia apenas a primeira hierarquia
Um documento pode gerar ANTTs distintos em cada hierarquia, ou ter uma hierarquia averbada e outra recusada. Percorra o array inteiro e grave o resultado de cada uma.
:::

## Nem toda hierarquia tem `endorsement`

O conteúdo de `produtos[].data` **muda conforme a operação**:

| Operação | Conteúdo de `data` |
|---|---|
| Averbação de CT-e / NF-e / Outros | `{ "endorsement": { … } }` |
| Averbação de MDF-e | `{ "mdfe": { … } }` |
| Cancelamento de CT-e / NF-e / Outros | `{ "event": [ { … } ] }` |
| Cancelamento / encerramento de MDF-e | `{ "event_mdfe": { … }, "des_endereco_xml": "…" }` |
| Produto RC-V averbado | `{ "processed": true, "pending": true, "documento": { … }, "policy": { … } }` |
| Produto RC-V cancelado | um **array**, sem o envelope `event` |
| Evento já processado anteriormente | `{}` (objeto vazio) |
| Produto com falha | **campo `data` ausente**, com `error` preenchido |

:::caution Sempre verifique a existência de `data`
Trate `data`, `data.endorsement`, `data.event` etc. como opcionais. Em cancelamentos e MDF-e **não existe** `data.endorsement`, e em falhas o `data` pode não vir. Acessos diretos sem verificação quebram a integração.
:::
