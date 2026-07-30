---
sidebar_position: 5
title: MDF-e
---

# MDF-e (`mdfe`)

Retorno do processamento de um **Manifesto Eletrônico de Documentos Fiscais**. Pode chegar como:

```text
resposta.mdfe                                              (documento simples)
resposta.produtos.TRANSPORTE.data.mdfe                     (emitente com vários produtos)
resposta.emitentes[i].produtos.TRANSPORTE.data.mdfe        (multi-hierarquia)
```

:::info MDF-e não gera ANTT
O MDF-e é a viagem, não a averbação da carga. Não há `antts` neste retorno — o identificador do processamento é `id_averbgo_mdfe`. As averbações são as dos CT-e/NF-e relacionados.
:::

## Exemplo

```json
{
  "message": "Processamento de MDFe concluido com sucesso!",
  "mdfe": {
    "id_averbgo_mdfe": "1075df34-b408-4586-8059-e9a92f148860",
    "num_chave_viagem": "3522073318365800013358000021009283122234751",
    "num_viagem": "2473",
    "num_serie_viagem": "0",
    "dhr_envio": "2026-07-16T17:16:39-03:00",
    "data_envio": "2026-07-16",
    "hora_envio": "17:16:39",
    "data_emissao": "2022-07-12",
    "hora_emissao": "13:00",
    "valor": 48062.31,
    "tipo_documento": "58",
    "tipo_emitente": "1",
    "cod_documento_emitente": "32004241000103",
    "nom_razao_social_emitente": "SUGGEST ONE CONSULTORIA LTDA",
    "cod_documento_relacionamento": "32004241000103",
    "nom_razao_social_relacionamento": "SUGGEST ONE CONSULTORIA LTDA",
    "cod_documento_parceiro": "61074175000138",
    "nom_razao_social_parceiro": "MAPFRE SEGUROS GERAIS S.A.",
    "cod_documento_cliente": "03724425000131",
    "nom_razao_social_cliente": "Vanessa Regina Alves",
    "qcte": "6",
    "qnfe": 0,
    "qmdfe": 0,
    "tomadores": [ { "cnpj_tomador": "16922038000151" } ],
    "descarregamento": [
      {
        "ibge_descarga": "3502804",
        "municipio_descarga": "ARACATUBA",
        "sigla_uf": "SP",
        "chave": "35220706016175000173570000002363391135461970"
      }
    ],
    "documentos": [
      { "tipo": "57 - Conhecimento", "chave": "35220706016175000173570000002363391135461970" }
    ]
  }
}
```

## Campos

### Identificação da viagem

| Campo | Tipo | Descrição |
|---|---|---|
| `id_averbgo_mdfe` | string (UUID) | **Identificador do processamento no AverbGo** — grave este valor |
| `num_chave_viagem` | string (44) | Chave de acesso do MDF-e |
| `num_viagem` | string | Número do manifesto |
| `num_serie_viagem` | string | Série |
| `tipo_documento` | number \| string | `58` |
| `tipo_emitente` | string | Tipo do emitente |

### Datas e valor

| Campo | Tipo | Descrição |
|---|---|---|
| `dhr_envio` | string ISO 8601 | Data/hora do processamento, com offset |
| `data_envio` / `hora_envio` | string | Mesma informação, em campos separados |
| `data_emissao` / `hora_emissao` | string | Emissão do MDF-e |
| `data_embarque` / `hora_embarque` | string | Embarque, quando informado (pode vir vazio) |
| `valor` | number | Valor total da carga manifestada |

### Partes envolvidas

| Campo | Descrição |
|---|---|
| `cod_documento_emitente` / `nom_razao_social_emitente` | Emitente do MDF-e |
| `cod_documento_relacionamento` / `nom_razao_social_relacionamento` | Relacionamento (segurado) |
| `cod_documento_parceiro` / `nom_razao_social_parceiro` | Seguradora/parceiro |
| `cod_documento_cliente` / `nom_razao_social_cliente` | Cliente |
| `tomadores[].cnpj_tomador` | Tomadores do serviço |

### Conteúdo do manifesto

| Campo | Tipo | Descrição |
|---|---|---|
| `qcte` / `qnfe` / `qmdfe` | number \| string | Quantidade de CT-e, NF-e e MDF-e relacionados |
| `documentos[]` | array | Documentos vinculados: `tipo` (ex.: `57 - Conhecimento`) e `chave` |
| `descarregamento[]` | array | Municípios de descarga: `ibge_descarga`, `municipio_descarga`, `sigla_uf`, `chave` |
| `carregamento[]` | array | Municípios de carregamento |
| `motoristas[]` / `veiculos[]` | array | Motoristas e veículos do manifesto |
| `naver` | — | Informação de averbação relacionada |
| `tip_status` / `des_tipo_status` | number/string | Situação do manifesto |
| `des_endereco_xml` | string | Referência interna do XML armazenado |

:::caution `qcte` e `qnfe` com tipos diferentes
Nos retornos observados, `qcte` chega como string (`"6"`) e `qnfe`/`qmdfe` como número (`0`). Converta antes de comparar.
:::

## Cancelamento e encerramento

Os eventos de MDF-e **não** usam este bloco: são devolvidos em `event_mdfe`. Ver [Eventos](./eventos.md).
