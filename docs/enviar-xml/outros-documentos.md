---
sidebar_position: 2.5
title: Outros documentos
---

# Outros documentos de transporte

Documentos que não são CT-e, NF-e nem MDF-e — NFS-e, CTRC, ordem de coleta, minuta, romaneio etc. — podem ser averbados como **"Outros"**. O envio reaproveita o **layout do CT-e** (`cteProc/CTe/infCte`), com três ajustes:

1. A tag `<mod>` recebe o código do tipo de documento (tabela abaixo), e não `57`.
2. Não tem o segmento `Signature` (assinatura digital).
3. Não tem o segmento `protCTe` (protocolo da SEFAZ) — exceto, opcionalmente, para informar a [chave do documento](#chave-do-documento).

Todo o resto é igual ao CT-e: **mesmo endpoint, mesma chave de acesso (token), mesmos headers** ([Requisição](./request.mdx)), mesmas [tags extras](./tags-extras.md) e mesmos [retornos](../retornos/averbacao.md).

:::tip Outros documentos ou documento mínimo?
- **Outros documentos (esta página):** um documento de **carga** sem XML fiscal próprio (NFS-e, CTRC, ordem de coleta etc.), no layout do CT-e.
- **[Documento mínimo RC-V](./documento-minimo-rcv.md):** a **viagem** sem documento fiscal, no layout do MDF-e com `mod` `59` — por exemplo, uma ordem de frete que reúne várias ordens de coleta, para averbar o RC-V.
:::

## Modelos

A tag `<mod>` aceita o código de quatro **ou** de dois dígitos — os dois identificam o mesmo documento:

| Documento | `<mod>` (4 dígitos) | `<mod>` (2 dígitos) |
|---|---|---|
| Romaneio | `1001` | `91` |
| RPS | `1002` | `92` |
| CRT | `1003` | `93` |
| Minuta | `1004` | `94` |
| Controle de Embarque | `1005` | `95` |
| MIC | `1006` | `96` |
| Ordem de Coleta | `1007` | `97` |
| NFS-e | `1008` | `98` |
| CTRC | `1009` | `99` |

## Estrutura do XML

```xml
<cteProc>
  <CTe>
    <infCte>
      <ide>
        <mod>1008</mod>
        <serie>1</serie>
        <nCT>35006</nCT>
        <dhEmi>2026-06-06T12:38:32</dhEmi>
        <tpAmb>1</tpAmb>
        <tpCTe>0</tpCTe>
        <modal>1</modal>
        <tpServ>0</tpServ>
        <cMunIni>3505708</cMunIni>
        <UFIni>SP</UFIni>
        <cMunFim>3552403</cMunFim>
        <UFFim>SP</UFFim>
        <toma03>
          <toma>0</toma>
        </toma03>
      </ide>
      <compl>
        <xObs>Observações gerais</xObs>
        <ObsCont xCampo="embarque">
          <xTexto>2026-06-06T23:45:59-03:00</xTexto>
        </ObsCont>
      </compl>
      <emit>
        <CNPJ>33183658000135</CNPJ>
        <enderEmit>
          <cMun>3550308</cMun>
          <UF>SP</UF>
        </enderEmit>
      </emit>
      <rem>
        <CNPJ>17625528000159</CNPJ>
        <enderReme>
          <cMun>3505708</cMun>
          <UF>SP</UF>
          <cPais>1058</cPais>
        </enderReme>
      </rem>
      <dest>
        <CNPJ>32004241000103</CNPJ>
        <enderDest>
          <cMun>3552403</cMun>
          <UF>SP</UF>
          <cPais>1058</cPais>
        </enderDest>
      </dest>
      <infCTeNorm>
        <infCarga>
          <vCarga>500000.01</vCarga>
        </infCarga>
        <seg>
          <respSeg>4</respSeg>
          <vCarga>500000.00</vCarga>
        </seg>
      </infCTeNorm>
    </infCte>
  </CTe>
  <!-- Opcional: chave montada pela TMS -->
  <protCTe>
    <infProt>
      <chCTe>000350060012026060600000000000</chCTe>
    </infProt>
  </protCTe>
</cteProc>
```

## Campos

| Tag | Tipo | Ocorr. | Observação |
|---|---|---|---|
| `cteProc` | | Obrigatória | Tag raiz |
| `cteProc/CTe` | | Obrigatória | Tag raiz |
| `CTe/infCte` | | Obrigatória | Informações do documento |
| **`infCte/ide`** | | Obrigatória | Identificação do documento |
| `ide/mod` | Número | Obrigatória | Código do documento — ver [Modelos](#modelos) |
| `ide/serie` | String (3) | Obrigatória | Série do documento |
| `ide/nCT` | String (9) | Obrigatória | Número do documento |
| `ide/dhEmi` | DateTime | Obrigatória | `AAAA-MM-DDTHH:MM:SS`, no horário de Brasília. Também aceita o fuso: `-03:00` |
| `ide/tpAmb` | String (1) | Obrigatória | `1` Produção · `2` Homologação |
| `ide/tpCTe` | String (1) | Obrigatória | `0` Normal · `1` Complemento de valores |
| `ide/modal` | String (1) | Condicional | `1` Rodoviário · `2` Aéreo · `3` Aquaviário · `4` Ferroviário · `5` Dutoviário |
| `ide/tpServ` | String (1) | Obrigatória | `0` Normal · `1` Subcontratação · `2` Redespacho · `3` Redespacho intermediário |
| `ide/cMunIni` | String (7) | Obrigatória | Código IBGE do município de origem |
| `ide/UFIni` | String (2) | Obrigatória | UF de origem. Exterior: `EX` |
| `ide/cMunFim` | String (7) | Obrigatória | Código IBGE do município de destino |
| `ide/UFFim` | String (2) | Obrigatória | UF de destino. Exterior: `EX` |
| `ide/toma03` | | Condicional | Grupo do tomador do serviço |
| `toma03/toma` | String (1) | Condicional | `0` Remetente · `1` Expedidor · `2` Recebedor · `3` Destinatário |
| **`infCte/compl`** | | Condicional | Informações complementares |
| `compl/xObs` | String (2000) | Condicional | Observações gerais |
| `compl/ObsCont` | | Condicional | [Tags extras](./tags-extras.md): atributo `xCampo` (até 20 caracteres) e `xTexto` (até 60 caracteres) |
| **`infCte/emit`** | | Obrigatória | Emitente do documento |
| `emit/CNPJ` | String (15) | Condicional | CNPJ do emitente cadastrado no AverbGo |
| `emit/enderEmit/cMun` | String (7) | Condicional | Código IBGE do município. Exterior: `9999999` |
| `emit/enderEmit/UF` | String (2) | Obrigatória | UF do emitente. Exterior: `EX` |
| **`infCte/rem`** | | Obrigatória | Remetente |
| `rem/CNPJ` | String (15) | Condicional | CNPJ do remetente |
| `rem/enderReme/cMun` | String (7) | Condicional | Código IBGE do município. Exterior: `9999999` |
| `rem/enderReme/UF` | String (2) | Condicional | Exterior: `EX` |
| `rem/enderReme/cPais` | String (4) | Obrigatória | Código do país (`1058` Brasil) |
| **`infCte/dest`** | | Obrigatória | Destinatário |
| `dest/CNPJ` | String (15) | Condicional | CNPJ do destinatário |
| `dest/enderDest/cMun` | String (7) | Condicional | Código IBGE do município. Exterior: `9999999` |
| `dest/enderDest/UF` | String (2) | Condicional | Exterior: `EX` |
| `dest/enderDest/cPais` | String (4) | Obrigatória | Código do país |
| **`infCte/infCTeNorm`** | | Obrigatória | Informações do documento |
| `infCTeNorm/infCarga` | | Obrigatória | Informações da carga |
| `infCarga/vCarga` | String (15) | Obrigatória | Valor total da carga. 13 inteiras e 2 decimais, ponto como separador: `10.00` |
| `infCarga/vCargaAverb` | String (15) | Opcional | Valor para averbação. **Se presente, prevalece sobre `seg/vCarga`** — ver [Valor averbado](#valor-averbado) |
| `infCTeNorm/seg` | | Obrigatória | Informações de seguro da carga |
| `seg/respSeg` | String (1) | Obrigatória | Responsável pelo seguro: `0` Remetente · `3` Destinatário · `4` Emitente · `5` Tomador |
| `seg/vCarga` | String (15) | Obrigatória | **Valor para averbação**, usado quando `vCargaAverb` não é enviada. Mesmo formato de `infCarga/vCarga` |

:::caution Limites de série e número
A série tem **até 3 dígitos** e o número **até 9 dígitos**. Documentos com numeração maior — como a NFS-e Nacional, com série de até 5 dígitos e número de até 13 — precisam ser adequados a esses limites pela TMS antes do envio.
:::

### Valor averbado

O valor averbado é lido nesta ordem:

1. **`infCarga/vCargaAverb`**, se a tag existir no XML — **sempre prevalece**, qualquer que seja o valor (mesmo `0.01`);
2. **`seg/vCarga`**, quando `vCargaAverb` não é enviada.

Use um desses campos quando o valor a averbar for diferente do valor total da carga (`infCarga/vCarga`) — por exemplo, limitado pela apólice.

:::caution Não envie `vCargaAverb` com valor provisório
Como `vCargaAverb` tem prioridade, um valor simbólico ou de teste nessa tag é o que será averbado, ignorando `seg/vCarga`. Se não for usá-la, omita a tag.
:::

## Chave do documento

Documentos "Outros" não têm chave da SEFAZ. A chave identifica o documento na averbação e é **obrigatória no cancelamento**. Há duas formas de obtê-la:

| Opção | Como funciona |
|---|---|
| **A TMS monta a chave** (opcional) | Informe-a em `protCTe/infProt/chCTe` no XML de averbação, como no exemplo acima |
| **O AverbGo gera a chave** | Se o XML vier sem chave, o AverbGo gera uma e a devolve no retorno da averbação, em `dfe.num_chave_dfe` |

Em qualquer dos casos, **grave a chave junto do documento**: é ela que vai no cancelamento.

### Montagem da chave

Mesma regra do [documento mínimo (modelo 59)](./documento-minimo-rcv.md#chave--protmdfeinfprotchmdfe): **30 dígitos**, concatenados sem espaços nem separadores, cada parte com zeros à esquerda:

| Posição | Tamanho | Conteúdo |
|---|---|---|
| 1–8 | 8 | Número do documento (`nCT`) |
| 9–11 | 3 | Série (`serie`) |
| 12–19 | 8 | Data de emissão (`dhEmi`), no formato `AAAAMMDD` |
| 20–30 | 11 | Zeros (`00000000000`) — o layout não tem condutor |

Exemplo com `nCT` = 35006, `serie` = 1 e `dhEmi` = 2026-06-06:

```text
00035006  001  20260606  00000000000
└─ nº ─┘  └s┘  └─ data ┘  └─ zeros ─┘

000350060012026060600000000000
```

## Tags extras

As [tags extras](./tags-extras.md) funcionam exatamente como no CT-e, em `<compl><ObsCont>`: embarque, motoristas, veículos, coberturas adicionais e o [Código de Liberação de LMG](./tags-extras.md#código-de-liberação-de-lmg).

## Retorno

Os retornos são **os mesmos do CT-e**: bloco [`endorsement`](../retornos/averbacao.md), com o número de averbação no array `antts`. Quando o emitente tem mais de um produto ou relacionamento, a resposta vem agrupada em `emitentes[]` — ver [Visão geral dos retornos](../retornos/visao-geral.md).

:::caution `tipo_documento` no retorno
O campo `tipo_documento` pode vir como `57`, e não com o modelo enviado. Use o modelo que a própria TMS enviou para classificar o documento.
:::

## Reenvio

| Situação do documento | Efeito do reenvio |
|---|---|
| Já averbado | Nada muda: o retorno é *"Documento já existe na base de dados"* (duplicidade) |
| Recusado | O documento corrigido é reprocessado e, se aprovado, passa a **Averbado** |

## Cancelamento

O cancelamento usa o **mesmo endpoint**, com o layout de cancelamento do CT-e (`retCancCTe`, versão 1.04) e alguns valores fixos:

```xml
<retCancCTe xmlns="http://www.portalfiscal.inf.br/cte" versao="1.04">
  <infCanc>
    <tpAmb>1</tpAmb>
    <cUF>35</cUF>
    <verAplic>99</verAplic>
    <cStat>101</cStat>
    <xMotivo>Cancelamento de CT-e homologado</xMotivo>
    <chCTe>000350060012026060600000000000</chCTe>
    <dhRecbto>2026-06-07T10:00:00</dhRecbto>
    <nProt></nProt>
  </infCanc>
</retCancCTe>
```

| Tag | Valor |
|---|---|
| `tpAmb` | `1` Produção · `2` Homologação |
| `cUF` | Código IBGE da UF do emitente |
| `verAplic` | **Fixo `99`** |
| `cStat` | **Fixo `101`** |
| `xMotivo` | **Fixo** `Cancelamento de CT-e homologado` |
| `chCTe` | **A chave do documento** — a montada pela TMS ou a devolvida em `dfe.num_chave_dfe` |
| `dhRecbto` | Data e hora do cancelamento, `AAAA-MM-DDTHH:MM:SS` |
| `nProt` | Opcional: pode ir vazio ou repetir a chave |

:::caution Cancelamento em mês posterior ao da averbação
Se o cancelamento acontecer no mês seguinte ao da averbação, acrescente `<dhEmi>` com a data de emissão do documento, logo após `dhRecbto`:

```xml
    <dhRecbto>2026-07-02T10:00:00</dhRecbto>
    <dhEmi>2026-06-06T12:38:32</dhEmi>
    <nProt></nProt>
```
:::

:::caution Chave divergente = cancelamento recusado
A `chCTe` precisa ser **exatamente** a chave usada na averbação. Se não bater dígito a dígito, o sistema não encontra o documento e o cancelamento é recusado. O documento também precisa ter sido averbado antes.
:::

## Homologação

Valide a integração no ambiente de **qualidade** (ver [Ambientes](../ambientes.md)) antes de enviar documentos reais. O `tpAmb` tem o **mesmo comportamento do CT-e**.
