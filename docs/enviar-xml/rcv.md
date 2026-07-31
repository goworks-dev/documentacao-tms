---
sidebar_position: 3
title: Tags do RC-V
---

# Tags do RC-V em CT-e e NF-e

O seguro **RC-V** (Responsabilidade Civil de Veículos) precisa de dados de viagem, condutor e veículos que normalmente vêm do **MDF-e**. Quando o segurado **não emite MDF-e**, essas informações podem ser enviadas no próprio **CT-e** ou **NF-e**, usando as tags de informações complementares da SEFAZ.

| Documento | Onde as tags entram |
|---|---|
| CT-e | `<compl><ObsCont xCampo="…">` |
| NF-e | `<infAdic><obsCont xCampo="…">` |

:::info E quando não há documento fiscal?
Se o segurado não emite CT-e nem NF-e — trabalha com ordem de frete ou controle interno —, o caminho é outro: montar o [documento mínimo](./documento-minimo-rcv.md).
:::

:::caution O container muda entre CT-e e NF-e
No CT-e o grupo é `compl`; na NF-e é `infAdic`. É o erro mais comum na primeira implementação — a tag vai no lugar errado e o dado simplesmente não chega.
:::

São três tags, e cada uma carrega **vários campos numa única string**, separados por ponto e vírgula:

| Tag | Conteúdo |
|---|---|
| `rcv` | Viagem, condutor |
| `rcvVeiculos1` | Veículo de tração e reboque 1 |
| `rcvVeiculos2` | Reboques 2 e 3 |

> Referência: layout "RCV com CTe e NFe", versão 1.2.

## Como os campos são lidos

- O separador é o **ponto e vírgula** (`;`).
- A leitura é **posicional**: vale a ordem, não o nome. O terceiro valor da `rcv` é sempre o identificador de viagem.
- Campo sem informação **não pode ser omitido** — mantenha o `;` para preservar as posições seguintes.
- Só campos não obrigatórios podem ficar vazios.

## Tag `rcv` — viagem e condutor

| # | Campo | Obrigatório | Tipo | Tam. máx. | Observações |
|---|---|---|---|---|---|
| 1 | Data da viagem | Não | Data | 25 | Data e hora previstas de início. Formato ISO 8601 com fuso: `2024-01-29T14:57:29-03:00` |
| 2 | Tipo de transportador | Não | Número | 1 | `1` ETC · `2` TAC · `3` CTC · `4` Frota |
| 3 | Identificador de viagem | Não | Texto/Número | 12 | Número de manifesto, romaneio ou equivalente |
| 4 | Documento do condutor | **Sim** | Número | 11 | CPF do motorista, só dígitos |
| 5 | Nome do condutor | **Sim** | Texto | 60 | |

```xml
<ObsCont xCampo="rcv">
  <xTexto>2024-01-29T14:57:29-03:00;1;12345678;00011122285;Joao da Silva</xTexto>
</ObsCont>
```

## Tag `rcvVeiculos1` — tração e reboque 1

| # | Campo | Obrigatório | Tipo | Tam. máx. | Observações |
|---|---|---|---|---|---|
| 1 | Placa da tração | **Sim** | Texto | 7 | |
| 2 | RNTRC da tração | Não | Número | 8 | Registro Nacional de Transportadores Rodoviários de Carga |
| 3 | Documento do proprietário da tração | **Sim** | Número | 14 | CPF ou CNPJ, só dígitos |
| 4 | Nome do proprietário da tração | **Sim** | Texto | 40 | Razão social ou nome |
| 5 | Tipo de proprietário da tração | Não | Número | 1 | `0` TAC Agregado · `1` TAC Independente · `2` Outros · `4` Frota |
| 6 | Placa do reboque 1 | **Sim** | Texto | 7 | |
| 7 | RNTRC do reboque 1 | Não | Número | 8 | |
| 8 | Documento do proprietário do reboque 1 | Não | Número | 14 | CPF ou CNPJ |
| 9 | Nome do proprietário do reboque 1 | Não | Texto | 40 | |
| 10 | Tipo de proprietário do reboque 1 | Não | Número | 1 | Mesma tabela do campo 5 |

```xml
<ObsCont xCampo="rcvVeiculos1">
  <xTexto>ASD1S12;12345678;12123123000112;Zeraias Transportes;4;QWE2E34;87654321;12123123000112;Zeraias Transportes;4</xTexto>
</ObsCont>
```

## Tag `rcvVeiculos2` — reboques 2 e 3

Mesma estrutura da anterior, para o segundo e o terceiro reboque.

| # | Campo | Obrigatório | Tipo | Tam. máx. |
|---|---|---|---|---|
| 1 | Placa do reboque 2 | **Sim** | Texto | 7 |
| 2 | RNTRC do reboque 2 | Não | Número | 8 |
| 3 | Documento do proprietário do reboque 2 | Não | Número | 14 |
| 4 | Nome do proprietário do reboque 2 | Não | Texto | 40 |
| 5 | Tipo de proprietário do reboque 2 | Não | Número | 1 |
| 6 | Placa do reboque 3 | **Sim** | Texto | 7 |
| 7 | RNTRC do reboque 3 | Não | Número | 8 |
| 8 | Documento do proprietário do reboque 3 | Não | Número | 14 |
| 9 | Nome do proprietário do reboque 3 | Não | Texto | 40 |
| 10 | Tipo de proprietário do reboque 3 | Não | Número | 1 |

## Campos vazios

Um campo sem valor vira um separador vazio. Exemplo da `rcv` **sem a data da viagem** (posição 1):

```xml
<ObsCont xCampo="rcv">
  <xTexto>;1;000012345678;00011122285;Joao da Silva</xTexto>
</ObsCont>
```

A string começa direto no `;` — a posição 1 existe, mas está vazia.

Exemplo da `rcvVeiculos1` **sem o RNTRC da tração** (posição 2):

```xml
<ObsCont xCampo="rcvVeiculos1">
  <xTexto>ASD1S12;;12123123000112;Zeraias Transportes;4;QWE2E34;87654321;12123123000112;Zeraias Transportes;4</xTexto>
</ObsCont>
```

Repare no `;;`: placa, RNTRC vazio, documento do proprietário.

:::caution Não "encurte" a string
Omitir um campo em vez de deixar o separador desloca todos os seguintes. O sistema lê por posição — o nome do proprietário passa a ser interpretado como tipo de proprietário, e por aí vai.
:::

## Exemplo completo

```xml
<compl>
  <ObsCont xCampo="rcv">
    <xTexto>2024-01-29T14:57:29-03:00;1;12345678;00011122285;Joao da Silva</xTexto>
  </ObsCont>
  <ObsCont xCampo="rcvVeiculos1">
    <xTexto>ASD1S12;12345678;12123123000112;Zeraias Transportes;4;QWE2E34;87654321;12123123000112;Zeraias Transportes;4</xTexto>
  </ObsCont>
  <ObsCont xCampo="rcvVeiculos2">
    <xTexto>RTY3R56;11223344;12123123000112;Zeraias Transportes;4;UIO4U78;55667788;12123123000112;Zeraias Transportes;4</xTexto>
  </ObsCont>
</compl>
```

## Comportamentos do sistema

**Identificador de viagem** — quando informado, o sistema usa esse valor para **unificar CT-es e NF-es na mesma viagem**. Documentos que compartilham o identificador são tratados como uma viagem só. Se a sua operação agrupa cargas, preencher esse campo é o que evita viagens duplicadas.

**Tipo de transportador** — se não vier preenchido, o sistema assume **`2` (TAC)** como padrão.

**Placa de reboque** — o layout marca as placas de reboque como obrigatórias, mas elas **não entram no cálculo do prêmio**; servem para a emissão do certificado. Se a operação não tem reboque, confirme o preenchimento esperado com o suporte antes de subir para produção.

:::caution Conta no limite de 10 `ObsCont`
Essas três tags ocupam **três** das dez ocorrências que a SEFAZ permite por documento. Somadas às demais [tags extras](./tags-extras.md) exigidas pela apólice, o limite chega rápido.
:::

## Já envio esses dados de outro jeito

Se o segurado já informa parte desses dados no XML em outro formato próprio, o sistema pode ser adaptado para ler de lá, sem que o TMS precise implementar o layout acima. Isso depende de avaliação técnica.

Envie um **XML de exemplo** para **sac@averbgo.com.br** descrevendo onde os dados estão hoje.
