---
sidebar_position: 1
title: Visão geral dos retornos
---

# Visão geral dos retornos

Toda resposta da API é um JSON com um campo **`message`** e, conforme o caso, **um** bloco de dados. O bloco presente indica o que foi processado.

```json
{
  "message": "texto descritivo do processamento",
  "<bloco de dados>": { … }
}
```

## Os seis blocos

| Bloco | Significado | Detalhamento |
|---|---|---|
| `emitentes` | Mesmo emitente vinculado a **mais de uma hierarquia** (cliente/parceiro). Cada hierarquia traz seus próprios produtos. | [Multi-hierarquia](./multi-hierarquia.md) |
| `produtos` | Resultado **por produto contratado** (Transporte, RC-V, Transmissão). | [Produtos](./produtos.md) |
| `endorsement` | Averbação de CT-e, NF-e ou Outros. Contém o número **ANTT**. | [Averbação](./averbacao.md) |
| `mdfe` | Processamento de MDF-e. | [MDF-e](./mdfe.md) |
| `event` | Evento de cancelamento de CT-e / NF-e / Outros. | [Eventos](./eventos.md) |
| `event_mdfe` | Cancelamento ou encerramento de MDF-e. | [Eventos](./eventos.md) |

Os blocos podem se combinar: é comum receber `message` + `endorsement` + `produtos`, ou `message` + `mdfe` + `produtos`.

:::caution Não assuma um formato fixo
O formato varia conforme o tipo de documento, a quantidade de emitentes envolvidos e os produtos contratados pelo segurado — e pode mudar para um mesmo cliente quando ele contrata um novo produto. Implemente a árvore de decisão abaixo, não um `if` para um único campo.
:::

## Árvore de decisão

Ordem recomendada de verificação:

```text
1. HTTP 2xx ?
   não → trate como erro (ver "Erros")
   sim ↓

2. resposta.emitentes é um array ?
   sim → percorra as hierarquias e consolide o resultado  [Multi-hierarquia]
   não ↓

3. resposta.produtos existe ?
   sim → consolide o resultado dos produtos               [Produtos]
   não ↓

4. qual bloco veio?
   endorsement  → averbação concluída, leia antts[]       [Averbação]
   mdfe         → MDF-e processada                        [MDF-e]
   event        → evento de cancelamento processado       [Eventos]
   event_mdfe   → cancelamento/encerramento de MDF-e      [Eventos]
   nenhum       → leia message; trate como não averbado
```

## Como determinar o resultado final

O sinal mais confiável **não** é o código HTTP isolado, e sim a combinação abaixo:

| Situação | Como identificar | Resultado para o TMS |
|---|---|---|
| Sucesso total | HTTP 2xx e **nenhum** produto com `success: false` | Averbado |
| Sucesso parcial | HTTP 2xx e **pelo menos um** produto com `success: true` e outro com `success: false` | Averbado com pendência — exige tratamento |
| Falha | HTTP de erro, **ou** todos os produtos com `success: false` | Não averbado |

:::caution Sucesso parcial existe e precisa de tratamento
Quando o emitente tem mais de um produto contratado, é possível que o Transporte seja averbado e o RC-V falhe (ou o contrário). A resposta ainda vem com HTTP de sucesso. Se o TMS considerar "HTTP 200 = tudo certo", o documento fica com um produto **não averbado** sem que ninguém perceba.
:::

## Onde está o número da averbação

O número **ANTT** é o número da averbação e deve ser gravado pelo TMS.

| Formato do retorno | Caminho do ANTT |
|---|---|
| `endorsement` | `endorsement.antts[].antt` — pode haver **mais de um** (um por apólice) |
| `produtos` | `produtos.TRANSPORTE.data.endorsement.antts[].antt` |
| `emitentes` | `emitentes[].produtos.TRANSPORTE.data.endorsement.antts[].antt` — **por hierarquia** |
| `mdfe` | Não há ANTT. O identificador é `mdfe.id_averbgo_mdfe` |
| `event` / `event_mdfe` | Não há ANTT. São eventos sobre um documento já averbado |

:::info Mais de um ANTT
`antts` é um **array**. Emitente com duas apólices vigentes recebe um número por apólice. Grave todos: cada um se refere a uma apólice diferente (`numero_apolice`).
:::

## Campos sempre presentes

| Campo | Tipo | Descrição |
|---|---|---|
| `message` | string | Descrição do processamento. Em falhas parciais, traz o resumo por produto separado por `\|`. |

:::caution `message` é texto livre
A `message` serve para exibição ao usuário e para log. **Não use a `message` como regra de negócio** — a redação pode mudar. Baseie a lógica em `success`, `statusCode` e `error`.
:::
