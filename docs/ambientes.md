---
sidebar_position: 2
title: Ambientes
---

# Ambientes

O AverbGo disponibiliza dois ambientes:

| Ambiente | URL base | Uso |
|---|---|---|
| **Produção (PRD)** | `https://api.averbgo.com.br/v1` | Documentos reais, averbações válidas |
| **Qualidade (QA)** | `https://api.qa.averbgo.com.br` | Homologação da integração |

Montagem da URL final:

```text
PRD  →  https://api.averbgo.com.br/v1/averbacao/process_xml
QA   →  https://api.qa.averbgo.com.br/averbacao/process_xml
```

:::caution Atenção ao prefixo `/v1`
O prefixo `/v1` existe **apenas em produção**. O ambiente de qualidade responde na raiz. Monte a URL a partir da constante de ambiente, nunca concatenando `/v1` fixo no código.
:::

## Homologação

Antes de liberar a integração em produção, valide em QA no mínimo:

- envio de CT-e, NF-e e MDF-e autorizados;
- envio de evento de cancelamento e, para MDF-e, de encerramento;
- um cenário de **recusa** (por exemplo, documento fora do prazo de averbação);
- um cenário de **duplicidade** (reenvio do mesmo documento);
- um cenário de **falha parcial**, quando o emitente tem mais de um produto contratado.

As chaves de acesso de QA são independentes das de produção e devem ser geradas no portal correspondente.

:::info
Os dados enviados em QA não geram averbação válida e não são considerados pela seguradora.
:::
