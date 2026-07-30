---
sidebar_position: 4
title: Averbação (endorsement)
---

# Averbação (`endorsement`)

É o retorno da averbação de **CT-e, NF-e e documentos "Outros"**. Contém o número **ANTT** — o número da averbação.

Pode chegar de três formas:

```text
resposta.endorsement                                            (documento simples)
resposta.produtos.TRANSPORTE.data.endorsement                   (emitente com vários produtos)
resposta.emitentes[i].produtos.TRANSPORTE.data.endorsement      (multi-hierarquia)
```

## Exemplo

```json
{
  "message": "Processo de Averbação concluído com sucesso!",
  "endorsement": {
    "dfe": {
      "id_averbgo_dfe": "ec4c67bb-95f3-4118-a0d2-93c32a9fd851",
      "id_tipo_dfe": 55,
      "doc_apoio": "dfe-67744e6e-5ffd-4e18-8ecd-86b99771cbc8",
      "initialTag": "nfeproc",
      "docType": "nfe",
      "num_chave_dfe": "52260606314327000203550010104390271608635159",
      "xml": "XML ORIGINAL"
    },
    "id_documento": "ec4c67bb-95f3-4118-a0d2-93c32a9fd851",
    "cod_usuario": "JC DISTRIBUICAO",
    "data_emissao": "2026-06-01",
    "hora_emissao": "22:13:00",
    "valor_carga": 15.26,
    "valor_total": 15.26,
    "valor_carga_segurado": 15.26,
    "cidade_origem_nome": "APARECIDA DE GOIANIA - GO",
    "ufini": "GO",
    "cidade_destino_nome": "HIDROLINA - GO",
    "uffim": "GO",
    "cnpj_emitente": "06314327000203",
    "nom_fantasia_emitente": "JC DISTRIBUICAO",
    "cnpj_relacionamento": "06314327000114",
    "nom_fantasia_relacionamento": "JC DISTRIBUICAO",
    "motivo": "",
    "dhr_averbacao": "2026-06-02T11:28:59-03:00",
    "data_embarque": "2026-06-02",
    "hora_embarque": "11:28:56",
    "numero_documento": "10439027",
    "num_serie_documento": "1",
    "tip_status": 1,
    "des_tipo_status": "Averbado",
    "tipo_documento": 55,
    "modal": "01",
    "urbano": "Sim",
    "isencao": { "id_isencao": null, "cod_docum_res": null, "tipo_isencao": "Sem isenção" },
    "apolices": [ { "…": "…" } ],
    "antts": [ { "antt": "0623801243318365800013555000001822047097", "numero_apolice": "33333" } ]
  }
}
```

## Campos principais

### Identificação

| Campo | Tipo | Descrição |
|---|---|---|
| `id_documento` | string (UUID) | Identificador da averbação no AverbGo. Use-o em consultas ao suporte |
| `numero_documento` | string | Número do documento fiscal |
| `num_serie_documento` | string | Série do documento |
| `tipo_documento` | number \| string | Modelo do documento: `55` NF-e, `57` CT-e, `58` MDF-e. Documentos "Outros" usam os modelos `91` a `99` e `1001` a `1009` |
| `modal` | string | Código do modal (`01` rodoviário) |
| `urbano` | string | `Sim` / `Não` |
| `cod_usuario` | string | Usuário/identificação do emitente no AverbGo |

:::caution `tipo_documento` ora número, ora texto
Este campo já foi observado como número (`57`) e como string (`"57"`) em respostas diferentes. Faça a comparação convertendo para texto — por exemplo `String(tipo_documento) === "57"` — em vez de comparação estrita de tipo.
:::

### Situação

| Campo | Tipo | Descrição |
|---|---|---|
| `tip_status` | number | `1` = averbado |
| `des_tipo_status` | string | Descrição da situação (ex.: `Averbado`) |
| `motivo` | string | Motivo, quando houver (recusas e situações especiais). Vazio em averbações normais |
| `dhr_averbacao` | string ISO 8601 | Data/hora da averbação, **com offset** (`2026-06-02T11:28:59-03:00`) |
| `id_meio_averbacao` | number | Meio pelo qual a averbação foi feita |

:::caution Fuso horário
`dhr_averbacao` traz o offset explícito. Converta a partir do offset recebido — não presuma UTC nem horário local, e não aplique correções fixas de fuso.
:::

### Números de averbação

| Campo | Tipo | Descrição |
|---|---|---|
| `antts` | array | Lista de averbações geradas |
| `antts[].antt` | string | **Número da averbação (ANTT)** — grave este valor |
| `antts[].numero_apolice` | string | Apólice que gerou aquele número |

### Datas e valores

| Campo | Tipo | Descrição |
|---|---|---|
| `data_emissao` / `hora_emissao` | string | Emissão do documento |
| `data_embarque` / `hora_embarque` | string | Embarque considerado |
| `valor_carga` | number | Valor da carga |
| `valor_total` | number | Valor total do documento |
| `valor_carga_segurado` | number | Valor efetivamente segurado |
| `cod_impor_ept` | number | Indicador de importação/exportação |

### Origem e destino

| Campo | Tipo | Descrição |
|---|---|---|
| `cidade_origem_id` / `cidade_origem_nome` | string | Código IBGE e nome da cidade de origem |
| `ufini` | string | UF de origem |
| `cidade_destino_id` / `cidade_destino_nome` | string | Código IBGE e nome da cidade de destino |
| `uffim` | string | UF de destino |

### Emitente e relacionamento

| Campo | Tipo | Descrição |
|---|---|---|
| `id_pessoa_emitente` | string (UUID) | Emitente no AverbGo |
| `cnpj_emitente` | string | CNPJ do emitente |
| `nom_fantasia_emitente` | string | Nome fantasia do emitente |
| `cnpj_relacionamento` | string | CNPJ do relacionamento (segurado/contratante) |
| `nom_fantasia_relacionamento` | string | Nome fantasia do relacionamento |

### Documento eletrônico (`dfe`)

| Campo | Tipo | Descrição |
|---|---|---|
| `dfe.id_averbgo_dfe` | string (UUID) | Identificador do XML recebido |
| `dfe.num_chave_dfe` | string (44) | Chave de acesso do documento |
| `dfe.id_tipo_dfe` | number \| string | Modelo do documento |
| `dfe.docType` | string | Tipo detectado (`nfe`, `cte`, `mdfe`) |
| `dfe.initialTag` | string | Tag raiz identificada no XML |
| `dfe.doc_apoio` | string | Referência interna do documento de apoio |
| `dfe.xml` | string | **Eco do XML enviado** |

:::caution `dfe.xml` deixa a resposta grande
O XML original é devolvido dentro da resposta e, em alguns casos, também a árvore do documento já convertida em JSON. Uma resposta pode passar de 100 KB. Dimensione timeouts e o armazenamento de logs considerando isso — ou descarte `dfe.xml` antes de persistir.
:::

### Isenção

| Campo | Tipo | Descrição |
|---|---|---|
| `isencao.tipo_isencao` | string | Ex.: `Sem isenção` |
| `isencao.id_isencao` | string \| null | Identificador da isenção |
| `isencao.cod_docum_res` | string \| null | Documento responsável |

### Apólices (`apolices[]`)

Lista das apólices consideradas. Campos mais usados:

| Campo | Tipo | Descrição |
|---|---|---|
| `id_apolice` | string (UUID) | Identificador da apólice |
| `cod_apolice` | string | Número da apólice |
| `cod_externo` | string | Código externo/da seguradora |
| `cod_susep` | number | Código SUSEP |
| `id_ramo` / `cod_sigla_ramo` / `des_ramo` | number/string | Ramo (ex.: `TRNAC` — Transporte Nacional) |
| `dhr_inicio_vigencia` / `dhr_fim_vigencia` | string ISO | Vigência |
| `sta_cobertura_roubo` | boolean | Cobertura de roubo |
| `sta_cobertura_2risco` | boolean | Cobertura de segundo risco |
| `vlr_img` | number | Limite máximo de garantia |
| `des_prazo_averbacao` / `num_prazo_averbacao` | string/number | Prazo de averbação (ex.: "Horas após Embarque") |
| `des_extrapolacao` | string | Comportamento ao extrapolar o limite (ex.: `Recusa`) |
| `tip_documento_autorizado` | array | Tipos de documento aceitos pela apólice |
| `nom_fantasia_emitente` / `nom_fantasia_relacionamento` | string | Partes da apólice |

:::info Campos adicionais
O bloco pode trazer campos extras conforme o ramo e o tipo de documento (por exemplo `tpServ`, `cnpj_tomador`, `condutores`, `veiculos`). Ignore com segurança os campos que o seu sistema não usa — e **não** falhe o parse ao encontrar campos desconhecidos.
:::
