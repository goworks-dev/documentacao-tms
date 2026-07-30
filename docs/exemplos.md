---
sidebar_position: 7
title: Exemplos por cenário
---

# Exemplos por cenário

Respostas reais (com identificadores mascarados) e o tratamento esperado.

## 1. Averbação de CT-e — sucesso

```json
{
  "message": "Processo de Averbação concluído com sucesso!",
  "endorsement": {
    "id_documento": "ec4c67bb-95f3-4118-a0d2-93c32a9fd851",
    "tipo_documento": "57",
    "dhr_averbacao": "2026-07-03T17:34:33-03:00",
    "des_tipo_status": "Averbado",
    "antts": [ { "antt": "0572007272419599200011857001000004465000", "numero_apolice": "5500032923" } ]
  }
}
```

**Tratamento:** documento averbado. Gravar `antts[0].antt` e `dhr_averbacao`.

---

## 2. Emitente com dois produtos — tudo processado

```json
{
  "message": "Processo de Averbação concluído com sucesso!",
  "produtos": {
    "TRANSPORTE": { "success": true, "statusCode": 201, "data": { "endorsement": { "antts": [ { "antt": "0012301283…" } ] } } },
    "RCV":        { "success": true, "statusCode": 202, "data": { "processed": true, "pending": true } }
  }
}
```

**Tratamento:** averbado. O ANTT vem do `TRANSPORTE`; o RC-V está processado com conclusão assíncrona (`pending: true`).

---

## 3. Sucesso parcial

```json
{
  "message": "Falha ao criar registro de Veículo",
  "produtos": {
    "TRANSPORTE": { "success": false, "statusCode": 500, "error": "MDFE_PROCESSING_ERROR",
                    "message": "Falha ao criar registro de Veículo" },
    "RCV":        { "success": true,  "statusCode": 202, "message": "Documento RC-V processado" }
  }
}
```

**Tratamento:** estado **parcial**. Exibir que o Transporte não foi averbado e o motivo. Reenviar apenas após corrigir o cadastro do veículo.

---

## 4. Multiemitente — averbação

```json
{
  "message": "2 emitente(s) processado(s) com sucesso",
  "emitentes": [
    { "emitente": "NR PARTICIPACOES", "cliente": "GPS-PAMCARY", "parceiro": "MAPFRE",
      "produtos": { "TRANSPORTE": { "success": true, "statusCode": 201,
        "data": { "endorsement": { "tipo_documento": "57", "dhr_averbacao": "2026-07-16T16:48:13-03:00",
                                   "antts": [ { "antt": "0012301283318365800013557000000035006034" } ] } } } } },
    { "emitente": "NR PARTICIPACOES", "cliente": "DATASYSTEM - RCV", "parceiro": "DATASYSTEM",
      "produtos": { "RCV": { "success": true, "statusCode": 202,
        "data": { "processed": true, "pending": true } } } } ]
}
```

**Tratamento:** averbado. Gravar o ANTT **por emitente** — cada relacionamento tem o seu.

---

## 5. Multiemitente — cancelamento com falha parcial

```json
{
  "message": "[NR PARTICIPACOES] TRANSPORTE: Evento de cancelamento processado com sucesso | [NR PARTICIPACOES] RCV: ERRO - O documento não pertence ao emitente",
  "emitentes": [
    { "produtos": { "TRANSPORTE": { "success": true, "statusCode": 200,
        "data": { "event": [ { "id_documento_cancelado": "6818e4e8-…", "tipo_evento": "110111",
                               "data_envio": "2026-07-16", "hora_envio": "16:42:42" } ] } } } },
    { "produtos": { "RCV": { "success": false, "statusCode": 500, "error": "EVENT_PROCESSING_ERROR",
                             "message": "O documento não pertence ao emitente - …" } } } ]
}
```

**Tratamento:** estado **parcial**. O cancelamento valeu para o Transporte; o RC-V precisa de verificação — o documento original provavelmente não foi enviado para aquele relacionamento.

---

## 6. MDF-e processada

```json
{
  "message": "Processamento de MDFe concluido com sucesso!",
  "mdfe": {
    "id_averbgo_mdfe": "1075df34-b408-4586-8059-e9a92f148860",
    "num_chave_viagem": "3522073318365800013358000021009283122234751",
    "dhr_envio": "2026-07-16T17:16:39-03:00",
    "qcte": "6", "qnfe": 0
  }
}
```

**Tratamento:** processado. Não há ANTT — gravar `id_averbgo_mdfe` como protocolo.

---

## 7. Encerramento de MDF-e

```json
{
  "emitentes": [ { "produtos": { "TRANSPORTE": { "success": true, "statusCode": 200,
    "data": { "event_mdfe": { "proceventomdfe": { "eventomdfe": { "infevento": {
                "chmdfe": "5322083427423300125755000001822045112103500**",
                "tpevento": "110112",
                "detevento": { "evencmdfe": { "descevento": "Encerramento",
                                              "nprot": "9432200125484**", "dtenc": "2022-07-05" } } } } } } } } } } ]
}
```

**Tratamento:** encerramento confirmado (`tpevento` `110112`). Protocolo em `evencmdfe.nprot`.

---

## 8. Recusa por prazo

```json
{
  "message": "TRANSPORTE: ERRO - O Prazo para averbação foi ultrapassado. Prazo de Averbação: Horas após Emissão | RCV: ERRO - Nenhuma apolice RCV vigente encontrada",
  "produtos": {
    "TRANSPORTE": { "success": false, "statusCode": 422, "error": "AVERBACAO_RECUSADA",
                    "message": "O Prazo para averbação foi ultrapassado. Prazo de Averbação: Horas após Emissão" },
    "RCV":        { "success": false, "statusCode": 404, "error": "APOLICE_NAO_ENCONTRADA",
                    "message": "Nenhuma apolice RCV vigente encontrada" }
  }
}
```

**Tratamento:** **falha** (nenhum produto com sucesso). Não reenviar automaticamente: exibir os dois motivos ao usuário.

---

## 9. Documento já averbado

```json
{
  "message": "Documento ja existe na base de dados. Chave do documento: 3522…",
  "error": "Documento ja existe na base de dados. Chave do documento: 3522…"
}
```

**Tratamento:** duplicidade. Se o TMS não tem registro da averbação anterior, consulte o portal ou o suporte para recuperar o ANTT.

---

## 10. Chave de emitente inativo

```json
{
  "message": "Usuário inativo ou não encontrado",
  "event": {
    "errors": [ { "field": "User", "message": "Usuário inativo ou não encontrado",
                  "rule": "USUARIO_INATIVO_OU_NAO_ENCONTRADO" } ],
    "errorCount": 1, "stage": "validation", "businessRuleViolation": true
  }
}
```

**Tratamento:** interromper a fila daquele cliente e orientar a verificação da chave no portal AverbGo.
