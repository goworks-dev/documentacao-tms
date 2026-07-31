---
sidebar_position: 2
title: Tags extras
---

# Tags extras

Alguns dados exigidos pela seguradora não têm campo próprio no layout da SEFAZ. Eles são enviados como **observações do contribuinte**, no grupo de informações complementares do documento:

```xml
<!-- CT-e -->
<compl>
  <ObsCont xCampo="NOME_DA_TAG">
    <xTexto>VALOR</xTexto>
  </ObsCont>
</compl>

<!-- NF-e -->
<infAdic>
  <obsCont xCampo="NOME_DA_TAG">
    <xTexto>VALOR</xTexto>
  </obsCont>
</infAdic>
```

- O atributo `xCampo` recebe o **nome da tag extra** (respeitando maiúsculas e minúsculas).
- O valor vai em `<xTexto>`.
- Tags que aceitam múltiplos valores (motoristas, veículos) podem se repetir.

:::caution Limite de 10 ocorrências
A SEFAZ aceita no máximo **10 grupos `ObsCont` por documento**. Cada tag extra ocupa uma ocorrência — e tags repetidas contam individualmente: dois `cpfMotorista` e dois `idVeiculo` já consomem quatro das dez.

Envie apenas as tags exigidas pela apólice do segurado. Se o documento passar do limite, a própria SEFAZ rejeita a autorização, antes mesmo de o XML chegar ao AverbGo.
:::

## Tags disponíveis

| Tag (CT-e e NF-e) | Campo | Formato / observação |
|---|---|---|
| `modal` | Tipo de modal | Código do modal |
| `ramo` | Ramo | Ramo de seguro |
| `ufCarrega` | UF de origem | Sigla (ex.: `SP`) |
| `ufDescarrega` | UF de destino | Sigla |
| `cidadeCarrega` | Cidade de origem | Nome ou código IBGE |
| `cidadeDescarrega` | Cidade de destino | Nome ou código IBGE |
| `tipoMerca` | Tipo de mercadoria | |
| `cpfMotorista` | CPF do motorista | Somente números; pode repetir |
| `rgMotorista` | RG do motorista | Pode repetir |
| `codLiberacao` | Código de liberação do motorista | |
| `idVeiculo` | Identificação do veículo | Placa; pode repetir |
| `veiculoProprio` | Transporte com veículo próprio | `S` ou `N` |
| `meiosProprios` | Transporte por meios próprios | `S` ou `N` |
| `rastreador` | Carga rastreada | `S` ou `N` |
| `escolta` | Carga escoltada | `S` ou `N` |
| `rcfdc` | Cobertura RCF-DC | `S` ou `N` |
| `opCargaDescarga` | Operação de carga e descarga | `S` ou `N` |
| `opIcamento` | Operação de içamento | `S` ou `N` |
| `opRemocao` | Operação de remoção | `S` ou `N` |
| `container` | Valor do container | Decimal com ponto (ex.: `1500.00`) |
| `acessorios` | Valor dos acessórios | Decimal |
| `frete` | Valor do frete | Decimal |
| `despesas` | Valor das despesas | Decimal |
| `impostos` | Valor dos impostos | Decimal — **somente CT-e** (na NF-e o dado é nativo) |
| `lucrosEsperados` | Valor dos lucros esperados | Decimal — **somente NF-e** |
| `avarias` | Valor de avarias | Decimal |
| `embarque` | Data e hora do embarque | ISO 8601 com fuso: `2022-11-28T23:45:59-03:00` |
| `tipViagemInternacional` | Importação / exportação | |
| `cnpjIsencao` | CNPJ de isenção | Somente números |

:::info Valores monetários
Use ponto como separador decimal e não use separador de milhar: `1500.00`, nunca `1.500,00`.
:::

## Exemplo completo

```xml
<compl>
  <ObsCont xCampo="embarque">
    <xTexto>2022-11-28T23:45:59-03:00</xTexto>
  </ObsCont>
  <ObsCont xCampo="cpfMotorista">
    <xTexto>36770479869</xTexto>
  </ObsCont>
  <ObsCont xCampo="cpfMotorista">
    <xTexto>00011122285</xTexto>
  </ObsCont>
  <ObsCont xCampo="idVeiculo">
    <xTexto>GEI6644</xTexto>
  </ObsCont>
  <ObsCont xCampo="idVeiculo">
    <xTexto>GEI6655</xTexto>
  </ObsCont>
  <ObsCont xCampo="rcfdc">
    <xTexto>S</xTexto>
  </ObsCont>
  <ObsCont xCampo="container">
    <xTexto>0.01</xTexto>
  </ObsCont>
  <ObsCont xCampo="acessorios">
    <xTexto>20.00</xTexto>
  </ObsCont>
  <ObsCont xCampo="despesas">
    <xTexto>50.00</xTexto>
  </ObsCont>
  <ObsCont xCampo="impostos">
    <xTexto>30.00</xTexto>
  </ObsCont>
  <ObsCont xCampo="avarias">
    <xTexto>40.00</xTexto>
  </ObsCont>
</compl>
```

:::caution As tags fazem parte do XML assinado
As `ObsCont` precisam estar no XML **antes da assinatura e da autorização**. Não é possível acrescentá-las depois: o documento perderia a validade da assinatura digital.
:::

## Quais tags são obrigatórias?

Depende da apólice e do ramo contratado pelo segurado. Em caso de dúvida sobre quais tags o cliente precisa enviar, consulte **sac@averbgo.com.br**.

## Seguro RC-V

O produto RC-V usa um conjunto próprio de tags (`rcv`, `rcvVeiculos1` e `rcvVeiculos2`), com vários campos posicionais dentro de cada uma. Está documentado em **[Tags do RC-V](./rcv.md)**.
