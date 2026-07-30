---
sidebar_position: 3
title: Autenticação
---

# Autenticação

Toda requisição é autenticada por uma **chave de acesso** (`SECRET_KEY`) enviada no header `Authorization`.

```text
Authorization: SECRET_KEY
```

:::info Sem `Bearer`
A chave vai **pura** no header, sem o prefixo `Bearer` e sem aspas.
:::

## Onde obter a chave

O próprio segurado gera a chave no portal AverbGo, em **[https://averbgo.com.br/main/chaves](https://averbgo.com.br/main/chaves)**.

Cada chave está vinculada a um emitente. Um TMS que atende vários embarcadores deve armazenar **uma chave por cliente** e usar a chave correta em cada envio — é a chave que identifica de quem é o documento.

:::caution Tratamento da chave
- Nunca versione a chave no código-fonte nem a exponha no front-end.
- Armazene-a criptografada, com acesso restrito.
- Em caso de suspeita de vazamento, gere uma nova no portal e desative a anterior.
:::

## A chave já nasce pronta

Não há etapa de validação ou ativação: assim que é gerada no portal, a chave está apta a enviar documentos. Basta configurá-la no TMS e começar a integrar.

Se quiser confirmar que a chave está correta antes de colocar a operação no ar, o caminho é enviar um documento no ambiente de [qualidade](./ambientes.md) e verificar o retorno.

## Chave inválida ou desativada

Uma chave revogada, expirada ou de emitente inativo faz a API responder **HTTP 401**.

:::caution Pare o envio no 401
`401` não é erro transitório: reenviar não resolve. O comportamento recomendado é **interromper a fila daquele cliente**, sinalizar a situação ao usuário e orientá-lo a verificar a chave no portal AverbGo. Continuar tentando apenas acumula documentos em erro.
:::
