---
sidebar_position: 4
title: Documento mínimo (RC-V)
---

# Documento mínimo para RC-V

Há operações em que o segurado **não emite documento fiscal algum** para a viagem — trabalha com ordem de frete, romaneio ou controle interno. Sem CT-e, NF-e ou MDF-e, não há XML para enviar.

Para esses casos existe o **documento mínimo**: um XML montado pelo próprio TMS no formato do MDF-e, contendo só o necessário para averbar o RC-V.

| Situação do cliente | O que enviar |
|---|---|
| Emite MDF-e | O próprio MDF-e |
| Emite CT-e ou NF-e, mas não MDF-e | O CT-e/NF-e com as [tags do RC-V](./rcv.md) |
| **Não emite documento fiscal** | **O documento mínimo desta página** |

:::caution Não é um documento fiscal
Esse XML **não é** um MDF-e: não passa pela SEFAZ, não tem protocolo de autorização e não tem validade fiscal. Ele apenas reaproveita a estrutura do MDF-e para transportar os dados da averbação. O que o identifica é o **`mod` fixo em `59`** — o modelo do RC-V, em vez do `58` do MDF-e real.
:::

O envio é pelo mesmo endpoint de sempre, descrito em [Requisição](./request.mdx).

## Estrutura mínima

```xml
<mdfeProc versao="3.00">
  <MDFe>
    <infMDFe>
      <ide>
        <mod>59</mod>
        <tpTransp>2</tpTransp>
        <serie>1</serie>
        <nMDF>1</nMDF>
        <dhEmi>2026-05-08T00:00:00-03:00</dhEmi>
        <UFIni>SP</UFIni>
        <UFFim>SP</UFFim>
        <infMunCarrega>
          <cMunCarrega>3527306</cMunCarrega>
          <xMunCarrega>Louveira</xMunCarrega>
        </infMunCarrega>
        <dhIniViagem>2026-05-22T09:10:14-03:00</dhIniViagem>
      </ide>
      <emit>
        <CNPJ>12123123000112</CNPJ>
      </emit>
      <infModal>
        <rodo>
          <infANTT>
            <RNTRC>12345678</RNTRC>
          </infANTT>
          <veicTracao>
            <placa>AAA1234</placa>
            <condutor>
              <xNome>NOME CONDUTOR</xNome>
              <CPF>00011122285</CPF>
            </condutor>
            <prop>
              <CPF>00011122285</CPF>
              <RNTRC>87654321</RNTRC>
              <xNome>NOME DO PROPRIETARIO</xNome>
              <tpProp>1</tpProp>
            </prop>
          </veicTracao>
          <veicReboque>
            <placa>AAA4321</placa>
          </veicReboque>
        </rodo>
      </infModal>
      <infDoc>
        <infMunDescarga>
          <cMunDescarga>3525904</cMunDescarga>
          <xMunDescarga>Jundiai</xMunDescarga>
          <infCTe>
            <chCTe></chCTe>
          </infCTe>
        </infMunDescarga>
      </infDoc>
      <tot>
        <vCarga>1.10</vCarga>
      </tot>
    </infMDFe>
  </MDFe>
  <protMDFe>
    <infProt>
      <chMDFe>000000010012026050800011122285</chMDFe>
    </infProt>
  </protMDFe>
</mdfeProc>
```

## Campos

### Identificação — `ide`

| Tag | Regra |
|---|---|
| `mod` | **Fixo em `59`**. É o que diferencia o documento mínimo de um MDF-e real |
| `tpTransp` | Tipo de transportador: `1` ETC · `2` TAC · `3` CTC |
| `serie` | Série do documento, 3 dígitos |
| `nMDF` | Número do documento, 9 dígitos |
| `dhEmi` | Data e hora de emissão, ISO 8601 com fuso |
| `dhIniViagem` | Início previsto da viagem. **Se não informado, o sistema adota `dhEmi` como data de embarque** |
| `UFIni` / `UFFim` | UF de origem e de destino da viagem |
| `infMunCarrega/cMunCarrega` | Código IBGE da cidade de origem |
| `infMunCarrega/xMunCarrega` | Nome da cidade de origem |

### Emitente — `emit`

| Tag | Regra |
|---|---|
| `CNPJ` | CNPJ do segurado, 14 dígitos, só números |

### Modal rodoviário — `infModal/rodo`

| Tag | Regra |
|---|---|
| `infANTT/RNTRC` | RNTRC do transportador |
| `veicTracao/placa` | Placa do veículo de tração |
| `veicTracao/condutor/xNome` | Nome do condutor |
| `veicTracao/condutor/CPF` | CPF do condutor |
| `veicTracao/prop/CPF` (ou `CNPJ`) | Documento do proprietário do veículo |
| `veicTracao/prop/RNTRC` | RNTRC do proprietário |
| `veicTracao/prop/xNome` | Razão social ou nome do proprietário |
| `veicTracao/prop/tpProp` | `0` TAC agregado · `1` TAC independente · `2` Outros |
| `veicReboque/placa` | Placa do reboque. O grupo aceita **até 3 reboques** |

### Documentos e totais

| Tag | Regra |
|---|---|
| `infMunDescarga/cMunDescarga` | Código IBGE da cidade de destino |
| `infMunDescarga/xMunDescarga` | Nome da cidade de destino |
| `infCTe/chCTe` | **Enviar vazio** — a estrutura é exigida pelo layout, mas não há CT-e vinculado |
| `tot/vCarga` | Valor da mercadoria. **Sem valor declarado, envie `0.00`** |

### Chave — `protMDFe/infProt/chMDFe`

Como o documento não é autorizado pela SEFAZ, não existe chave oficial: ela é montada pelo emissor. São **30 dígitos**, concatenados sem espaços nem separadores, cada parte com zeros à esquerda até completar o tamanho:

| Posição | Tamanho | Conteúdo |
|---|---|---|
| 1–8 | 8 | Número do documento (`nMDF`) |
| 9–11 | 3 | Série (`serie`) |
| 12–19 | 8 | Data de emissão (`dhEmi`), no formato `AAAAMMDD` |
| 20–30 | 11 | CPF do condutor |

Exemplo com `nMDF` = 1, `serie` = 1, `dhEmi` = 2026-05-08 e CPF = 00011122285:

```text
00000001  001  20260508  00011122285
└─ nº ─┘  └s┘  └─ data ┘  └── CPF ──┘

000000010012026050800011122285
```

:::caution São 30 dígitos, não 44
A chave do documento mínimo é **propositalmente diferente** da chave de acesso da SEFAZ, que tem 44 dígitos. Se o seu sistema valida tamanho ou aplica dígito verificador de chave fiscal, não reaproveite essa validação aqui.
:::

:::caution A chave é o vínculo com o cancelamento
Ela precisa ser **estável e única por documento** — é por ela que um cancelamento futuro encontra a averbação. Grave a chave gerada junto do registro da viagem no seu banco, em vez de recalculá-la depois: qualquer divergência de zeros à esquerda produz uma chave diferente.
:::

## Cancelamento

O cancelamento segue o formato de evento do MDF-e:

```xml
<procEventoMDFe>
  <eventoMDFe>
    <infEvento>
      <CNPJ>12123123000112</CNPJ>
      <chMDFe>000000010012026050800011122285</chMDFe>
      <tpEvento>110111</tpEvento>
      <detEvento>
        <evCancMDFe>
          <descEvento>Cancelamento</descEvento>
          <xJust>conhecimento incorreto</xJust>
          <dhRegEvento>2026-05-08T13:20:54-03:00</dhRegEvento>
        </evCancMDFe>
      </detEvento>
    </infEvento>
  </eventoMDFe>
</procEventoMDFe>
```

| Tag | Regra |
|---|---|
| `CNPJ` | CNPJ do emitente |
| `chMDFe` | **Exatamente a mesma chave montada no envio do documento original** |
| `tpEvento` | `110111` — cancelamento |
| `evCancMDFe/descEvento` | `Cancelamento` |
| `evCancMDFe/xJust` | Justificativa do cancelamento |
| `evCancMDFe/dhRegEvento` | Data e hora do cancelamento, ISO 8601 com fuso |

:::caution Chave divergente = cancelamento recusado
Se a `chMDFe` do evento não bater dígito a dígito com a do documento enviado, o sistema não encontra o que cancelar e o evento é recusado.
:::

## Retorno

O documento mínimo passa pelos mesmos formatos de resposta descritos em [Retornos da API](../retornos/visao-geral.md) — inclusive a consolidação por produto, quando o emitente tem mais de um contratado.
