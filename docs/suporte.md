---
sidebar_position: 8
title: Suporte e FAQ
---

# Suporte e FAQ

## Contato

| Assunto | Canal |
|---|---|
| Dúvidas de integração, homologação, liberação de acesso | **sac@averbgo.com.br** |
| Portal do segurado (chaves, apólices, consultas) | [averbgo.com.br](https://averbgo.com.br) |
| Geração de chave de acesso | [averbgo.com.br/main/chaves](https://averbgo.com.br/main/chaves) |

Ao abrir um chamado sobre um documento específico, informe:

- CNPJ do emitente;
- chave de acesso do documento (44 dígitos);
- data e hora do envio;
- **o JSON de retorno recebido** (é o que permite identificar o processamento).

## Perguntas frequentes

**Posso enviar o XML antes da autorização da SEFAZ?**
Não. O documento precisa estar autorizado e protocolado.

**Preciso enviar o MDF-e se já envio os CT-e?**
Sim, quando o segurado tem o produto correspondente. O MDF-e representa a viagem e complementa a informação das cargas.

**O reenvio do mesmo documento gera averbação duplicada?**
Não. A API identifica o documento pela chave e responde `DOCUMENTO_DUPLICADO` com `success: true`.

**Recebi HTTP 200, mas um produto veio com `success: false`. O documento está averbado?**
Parcialmente. O produto que falhou **não** foi averbado. Trate como pendência.

**Como sei qual é o número da averbação?**
É o `antt`, em `antts[].antt`. Pode haver mais de um quando o emitente tem mais de uma apólice vigente.

**O que faço quando recebo 401?**
Interrompa os envios daquele cliente e verifique a chave no portal. Reenviar não resolve.

**Qual o tempo de resposta esperado?**
Varia com o tamanho do documento e a quantidade de produtos. Use timeout de 60 segundos.

**Existe limite de requisições?**
Não há limite publicado, mas mantenha a concorrência moderada (2 a 5 envios simultâneos por cliente) para não formar fila desnecessária.

**Perdi o retorno de um envio. Como recupero o ANTT?**
Consulte o portal AverbGo ou o suporte, informando a chave do documento.

**A API tem consulta de status por documento?**
Não faz parte deste manual. Se a sua operação precisa disso, fale com o suporte.

## Histórico deste manual

| Versão | Data | Alterações |
|---|---|---|
| 2.0 | Julho/2026 | Reescrita completa. Inclusão dos formatos `emitentes`, `produtos`, `mdfe`, `event` e `event_mdfe`; catálogo de erros e códigos; guia de implementação; exemplos por cenário; separação de ambientes e autenticação. |
| 1.0 | 2022 | Versão inicial: envio de XML, tags extras e retorno `endorsement`. |
