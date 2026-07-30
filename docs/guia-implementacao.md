---
sidebar_position: 6
title: Guia de implementação
---

# Guia de implementação

Recomendações para uma integração estável em produção.

## Tratamento completo da resposta

Pseudocódigo cobrindo todos os formatos descritos neste manual:

```js
function tratarRetorno(httpStatus, corpo) {
  if (httpStatus === 401) {
    return { resultado: 'CHAVE_INVALIDA', pararFila: true };
  }
  if (httpStatus >= 400) {
    return {
      resultado: 'FALHA',
      mensagem: extrairMensagem(corpo),
      retentar: [500, 502, 503, 504].includes(httpStatus),
    };
  }

  // 1) multiemitente tem precedência
  const produtos = Array.isArray(corpo.emitentes)
    ? corpo.emitentes.flatMap(e => Object.entries(e.produtos ?? {}))
    : Object.entries(corpo.produtos ?? {});

  // 2) consolidação por produto
  if (produtos.length > 0) {
    const ok = produtos.filter(([, p]) => p.success === true);
    const falha = produtos.filter(([, p]) => p.success === false);
    const antts = extrairAntts(corpo);

    if (ok.length === 0) return { resultado: 'FALHA', detalhes: falha };
    if (falha.length > 0) return { resultado: 'PARCIAL', detalhes: falha, antts };
    return { resultado: 'AVERBADO', antts };
  }

  // 3) resposta simples, sem produtos
  if (corpo.endorsement) {
    return { resultado: 'AVERBADO', antts: extrairAntts(corpo) };
  }
  if (corpo.mdfe) {
    return { resultado: 'AVERBADO', protocolo: corpo.mdfe.id_averbgo_mdfe };
  }
  if (Array.isArray(corpo.event)) {
    const evento = corpo.event[0];
    return { resultado: 'EVENTO_OK', protocolo: evento?.id_documento_cancelado };
  }
  if (corpo.event_mdfe) {
    const info = corpo.event_mdfe.proceventomdfe?.eventomdfe?.infevento;
    return { resultado: 'EVENTO_OK', tipo: info?.tpevento };
  }

  // 4) nada reconhecido
  return {
    resultado: 'FALHA',
    mensagem: corpo.message ?? 'Retorno não reconhecido',
  };
}

function extrairAntts(corpo) {
  const coletar = produtos => Object.values(produtos ?? {})
    .map(p => p?.data?.endorsement)
    .filter(Boolean);

  const lista = [];
  if (Array.isArray(corpo.emitentes)) {
    corpo.emitentes.forEach(e => lista.push(...coletar(e.produtos)));
  } else {
    lista.push(...coletar(corpo.produtos));
  }
  if (corpo.endorsement) lista.push(corpo.endorsement);

  return lista.flatMap(e => (e.antts ?? []).map(a => ({
    antt: a.antt,
    apolice: a.numero_apolice,
    dataAverbacao: e.dhr_averbacao,
  })));
}
```

## Regras de ouro

1. **Decida por `success`**, nunca pela `message`. O texto pode mudar sem aviso.
2. **Percorra coleções**: `emitentes`, `produtos`, `antts` e `event` são listas ou mapas — nunca apenas o primeiro item.
3. **Trate campos opcionais**: `data`, `data.endorsement` e `error` podem não existir.
4. **Não falhe com campos desconhecidos**: novos campos podem ser incluídos a qualquer momento; o parse precisa ignorá-los.
5. **Converta tipos antes de comparar**: alguns campos numéricos chegam como texto e vice-versa (ver avisos abaixo).
6. **Guarde o JSON bruto do retorno**, ao menos por alguns meses. É a evidência da averbação em caso de sinistro ou divergência.

## Fila de envio

- Envie **um documento por requisição**.
- Use uma fila com concorrência limitada (2 a 5 requisições simultâneas por cliente é suficiente na maioria das operações).
- Aplique timeout generoso: a resposta devolve o XML original e pode passar de 100 KB. **60 segundos** é um valor seguro.
- Persista o estado de cada documento (enviado, averbado, parcial, erro) antes de seguir para o próximo.

## Retentativa

| Situação | Reenviar? |
|---|---|
| Timeout, `500`, `503`, `504`, erro de rede | Sim, com backoff exponencial e limite de tentativas |
| `400`, `404`, `422`, `businessRuleViolation: true` | Não — exige correção |
| `401` | Não — interromper a fila do cliente e avisar o usuário |
| Sucesso parcial | Somente após corrigir a causa do produto que falhou |

O reenvio é **idempotente**: um documento já averbado retorna `DOCUMENTO_DUPLICADO` com `success: true`, sem gerar nova averbação. Em caso de dúvida sobre o resultado (por exemplo, timeout depois do envio), reenviar é seguro.

## Ordem dos envios

```text
1. documento autorizado (CT-e / NF-e / MDF-e)
2. ...somente depois: eventos daquele documento (cancelamento, encerramento)
```

Um evento de documento que a API não conhece é recusado.

## O que exibir ao usuário

| Resultado | Sugestão de exibição |
|---|---|
| Averbado | Número ANTT + data/hora da averbação |
| Averbado (MDF-e) | `id_averbgo_mdfe` como protocolo |
| Sucesso parcial | Destaque visual próprio, listando **qual produto falhou e por quê** |
| Falha | Mensagem do produto (ou `event.errors[].message`), com ação sugerida |
| Chave inválida | Aviso para o responsável verificar a chave no portal |

:::caution Sucesso parcial precisa de visibilidade
Se a interface tratar parcial como sucesso, o usuário nunca perceberá que um produto ficou sem averbação. Use um estado próprio na listagem e nos relatórios.
:::

## Avisos consolidados

Pontos observados no comportamento atual da API que exigem atenção no código:

| # | Comportamento | Como se proteger |
|---|---|---|
| 1 | `tipo_documento` chega ora como número (`57`), ora como string (`"57"`) | Compare com `String(valor)` |
| 2 | `qcte` chega como string e `qnfe`/`qmdfe` como número | Converta antes de comparar |
| 3 | `event` é **array** no sucesso e **objeto** de validação em erros | Verifique `Array.isArray()` |
| 4 | `event_mdfe` não tem campos normalizados — espelha o XML da SEFAZ | Leia `proceventomdfe.eventomdfe.infevento.tpevento` |
| 5 | `produtos` pode vir `{}` vazio com mensagem de impedimento | `{}` = falha, não sucesso |
| 6 | `data` pode ser objeto, array ou ausente conforme produto e operação | Verifique o tipo antes de acessar |
| 7 | O prefixo `/v1` existe só em produção | Use constante por ambiente |
| 8 | A resposta ecoa o XML enviado em `dfe.xml` | Descarte antes de persistir, se não for usar |

## Checklist de homologação

- [ ] Envio de CT-e autorizado — ANTT gravado
- [ ] Envio de NF-e autorizada — ANTT gravado
- [ ] Envio de MDF-e — `id_averbgo_mdfe` gravado
- [ ] Cancelamento de CT-e/NF-e — evento processado
- [ ] Cancelamento e encerramento de MDF-e — evento processado
- [ ] Emitente multiemitente — todos os emitentes tratados
- [ ] Emitente com dois produtos — sucesso parcial exibido corretamente
- [ ] Documento fora do prazo — recusa tratada sem retentativa infinita
- [ ] Reenvio de documento já averbado — tratado como duplicidade
- [ ] Chave inválida (401) — fila interrompida e usuário avisado
- [ ] Timeout — retentativa com backoff, sem duplicar averbação
- [ ] Retorno bruto armazenado
