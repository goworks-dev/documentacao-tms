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
| `codliberacao` | Código de Liberação de LMG | Emitido pela seguradora; pode ser acrescentado após a emissão — ver [Código de Liberação de LMG](#código-de-liberação-de-lmg) |
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

**Exceção:** a tag `codliberacao` pode ser acrescentada ao XML **após a emissão**, para reenviar uma averbação recusada por LMG. Veja [Código de Liberação de LMG](#código-de-liberação-de-lmg).
:::

## Código de Liberação de LMG

### Quando usar

Quando a apólice do segurado está configurada pela seguradora com extrapolação de LMG **"Mediante Código"** e o valor da carga ultrapassa o **Limite Máximo de Garantia (LMG)**. Nesse caso a averbação é recusada, a menos que o documento informe um **Código de Liberação** válido, emitido pela seguradora.

O código pode chegar ao AverbGo em dois momentos:

| Cenário | Frequência | Como o código entra no XML |
|---|---|---|
| **Código obtido depois da recusa** | Caso mais comum | O segurado toma a recusa por LMG, pede o código à seguradora e a TMS acrescenta a tag ao XML **já autorizado** e reenvia. |
| **Código combinado antes da emissão** | Raro | Seguradora e segurado acertam o código previamente e o documento já é emitido com a tag. Só nesse caso a tag aparece nos documentos recebidos pela integração SEFAZ. |

:::tip O que a TMS precisa oferecer
Como o caso comum é a recusa vir primeiro, a TMS deve disponibilizar, no documento recusado por LMG, um **campo para o segurado informar o código** e uma ação de **reenviar a averbação**. Ao reenviar, a TMS acrescenta a tag `codliberacao` ao XML autorizado e envia esse XML ao AverbGo.

Esse XML alterado é uma versão **exclusiva para o AverbGo**: não deve ser reenviado à SEFAZ nem substituir o XML autorizado guardado pela TMS ou entregue a terceiros.
:::

### Como informar

O código vai como tag extra no próprio XML. Diferentemente das demais tags extras, essa **pode ser acrescentada ao XML após a autorização**.

CT-e (e documentos "Outros"), dentro de `<compl>`:

```xml
<compl>
  <ObsCont xCampo="codliberacao">
    <xTexto>CODIGO_INFORMADO_PELA_SEGURADORA</xTexto>
  </ObsCont>
</compl>
```

NF-e, dentro de `<infAdic>` (não usar `infCpl`):

```xml
<infAdic>
  <obsCont xCampo="codliberacao">
    <xTexto>CODIGO_INFORMADO_PELA_SEGURADORA</xTexto>
  </obsCont>
</infAdic>
```

### Regras

- O nome do campo (`xCampo`) pode vir em maiúsculas ou minúsculas.
- O código (`xTexto`) deve ser enviado exatamente como a seguradora o forneceu, sem espaços.
- A tag pode ser enviada junto com as demais tags extras (`embarque`, `ramo` etc.).
- Enviar a tag quando ela não é necessária (carga dentro do LMG, ou apólice sem "Mediante Código") não consome o código nem causa recusa.
- Cada averbação aprovada com o código consome um uso. O código pode ter validade, quantidade de usos e documento/série específicos, definidos pela seguradora.

### Fluxo após uma recusa por LMG

1. A averbação retorna recusa: *"Valor da Carga maior que o LMG cadastrado"*.
2. O segurado solicita o Código de Liberação à seguradora.
3. O segurado informa o código no campo da TMS, e a TMS reenvia o mesmo XML autorizado com a tag `codliberacao` acrescentada.
4. O AverbGo reprocessa a averbação recusada. Se o código for válido, ela passa a **Averbada**.

:::info Documento já averbado
Reenviar um documento que já está averbado não altera nada: o retorno é *"Documento já existe na base de dados"*.
:::

### Mensagens de recusa relacionadas ao código

| Mensagem | Significado |
|---|---|
| `Valor da Carga maior que o LMG cadastrado` | Código não informado, ou a carga supera também o limite do código |
| `Código de liberação não encontrado` | Código inexistente para este segurado (conferir digitação) |
| `Código de liberação não está ativo` | Código cancelado, bloqueado ou excluído pela seguradora |
| `A data do código liberação já expirou` | Validade vencida |
| `Código liberação não é válido para o documento` | Código emitido para outro número de documento |
| `Código liberação não é válido para a série do documento` | Código emitido para outra série |
| `Código liberação já atingiu o limite de uso` | Quantidade de usos esgotada |

## Quais tags são obrigatórias?

Depende da apólice e do ramo contratado pelo segurado. Em caso de dúvida sobre quais tags o cliente precisa enviar, consulte **sac@averbgo.com.br**.

## Seguro RC-V

O produto RC-V usa um conjunto próprio de tags (`rcv`, `rcvVeiculos1` e `rcvVeiculos2`), com vários campos posicionais dentro de cada uma. Está documentado em **[Tags do RC-V](./rcv.md)**.
