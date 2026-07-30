---
sidebar_position: 1
title: Visão geral
---

# Manual de Integração — API AverbGo

Este manual descreve como integrar um sistema de gestão de transporte (TMS), ERP ou emissor de documentos fiscais à **API de averbação do AverbGo**.

A integração tem um único objetivo: **enviar à seguradora, em tempo real, os documentos fiscais emitidos pelo segurado**, recebendo de volta o número de averbação (ANTT) e a situação de cada produto contratado.

## Para quem é este manual

Times de desenvolvimento que precisam:

- enviar CT-e, NF-e, MDF-e e documentos "Outros" logo após a autorização na SEFAZ;
- enviar eventos de **cancelamento** e **encerramento**;
- interpretar corretamente os diferentes formatos de resposta;
- tratar erros e recusas de averbação sem perder documentos.

## Como funciona, em cinco passos

1. O segurado gera a **chave de acesso** no portal AverbGo.
2. O TMS emite o documento fiscal e obtém o XML **autorizado e protocolado** pela SEFAZ.
3. O TMS envia o XML para `POST /averbacao/process_xml`, com a chave no header `Authorization`.
4. A API processa o documento em todos os **produtos** contratados pelo emitente (Transporte, RC-V, Transmissão) e devolve um JSON com o resultado de cada um.
5. O TMS registra o retorno — em especial o número **ANTT**, que é o número da averbação — e trata eventuais falhas.

```
  TMS/ERP                        API AverbGo                    Seguradora
     │                                │                              │
     │  POST /averbacao/process_xml   │                              │
     │  (XML autorizado + chave)      │                              │
     ├───────────────────────────────►│                              │
     │                                │  valida apólice, prazos,     │
     │                                │  coberturas e produtos       │
     │                                ├─────────────────────────────►│
     │  200 { message, … , antts }    │                              │
     │◄───────────────────────────────┤                              │
     │  grava ANTT e situação         │                              │
```

## Documentos aceitos

| Documento | Modelo | Tag inicial esperada no XML |
|---|---|---|
| CT-e | 57 | `<cteProc>` / `<CTe>` |
| NF-e | 55 | `<nfeProc>` / `<NFe>` |
| MDF-e | 58 | `<mdfeProc>` / `<MDFe>` |
| Outros documentos de transporte | 91 a 99 e 1001 a 1009 | conforme o layout do documento |
| Evento de cancelamento de CT-e | 110111 | `<procEventoCTe>` / `<eventoCTe>` |
| Evento de cancelamento de NF-e | 110111 | `<procEventoNFe>` |
| Evento de cancelamento de MDF-e | 110111 | `<procEventoMDFe>` / `<eventoMDFe>` |
| Evento de encerramento de MDF-e | 110112 | `<procEventoMDFe>` |

:::info
O XML deve estar no padrão SEFAZ e **protocolado** (documento autorizado). XMLs sem protocolo de autorização são recusados.
:::

:::tip Precisa enviar outro tipo de documento?
Consulte antes o suporte AverbGo: **sac@averbgo.com.br**.
:::

## O que mudou nesta versão do manual

Esta edição substitui integralmente a documentação anterior, que descrevia **apenas um** formato de resposta (`endorsement`). A API evoluiu e hoje responde em **seis formatos distintos**, conforme o tipo de documento e a quantidade de emitentes/produtos envolvidos:

| Formato | Quando ocorre | Capítulo |
|---|---|---|
| `emitentes[]` | mesmo emitente vinculado a mais de uma hierarquia (cliente/parceiro) | [Multi-hierarquia](./retornos/multi-hierarquia.md) |
| `produtos{}` | emitente com mais de um produto contratado | [Produtos](./retornos/produtos.md) |
| `endorsement` | averbação de CT-e, NF-e e Outros | [Averbação](./retornos/averbacao.md) |
| `mdfe` | processamento de MDF-e | [MDF-e](./retornos/mdfe.md) |
| `event` | evento de cancelamento de CT-e/NF-e | [Eventos](./retornos/eventos.md) |
| `event_mdfe` | cancelamento/encerramento de MDF-e | [Eventos](./retornos/eventos.md) |

:::caution Leia antes de codificar
Um integrador que trate **apenas** `endorsement` vai considerar como falha documentos que foram averbados com sucesso em outros formatos. O capítulo [Visão geral dos retornos](./retornos/visao-geral.md) traz a árvore de decisão completa.
:::
