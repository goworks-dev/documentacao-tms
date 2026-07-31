# Manual de Integração — API AverbGo

Documentação pública da API de averbação do AverbGo, destinada às TMS, ERPs e emissores fiscais que integram diretamente.

**No ar:** [documentacao-averbgo.vercel.app](https://documentacao-averbgo.vercel.app)

Construído com [Docusaurus 2](https://docusaurus.io/). O mesmo conteúdo alimenta o site e o manual em PDF.

## Estrutura

```
docs/
  intro.md                 visão geral, documentos aceitos
  ambientes.md             produção e qualidade
  autenticacao.md          chave de acesso
  enviar-xml/
    request.mdx            endpoint, headers, exemplos de código
    tags-extras.md         ObsCont e o limite da SEFAZ
    rcv.md                 layout posicional das tags do RC-V
    documento-minimo-rcv.md  XML modelo 59 para quem não emite documento fiscal
  retornos/                os seis formatos de resposta
    visao-geral.md         árvore de decisão
    multi-hierarquia.md    emitentes[]
    produtos.md            produtos{}
    averbacao.md           endorsement
    mdfe.md                mdfe
    eventos.md             event e event_mdfe
    erros.md               códigos, corpos e política de reenvio
  guia-implementacao.md    pseudocódigo, retentativa, checklist
  exemplos.md              cenários completos
  suporte.md               FAQ e contato
scripts/
  build-pdf.js             gera o PDF a partir de docs/
static/manual/             PDF publicado
```

## Desenvolvimento local

```bash
npm install
npm start          # servidor com recarga automática
npm run build      # build de produção; falha se houver link interno quebrado
npm run serve      # serve o build local
```

## Gerando o PDF

```bash
npm run pdf
```

Lê os capítulos de `docs/`, na ordem definida em `CHAPTERS` dentro de `scripts/build-pdf.js`, e escreve em `static/manual/Manual-Integracao-API-AverbGo.pdf` — o mesmo arquivo que o site oferece para download.

Precisa de um Chrome ou Edge instalado. Se estiver em caminho fora do padrão:

```bash
PUPPETEER_EXECUTABLE_PATH="/caminho/para/chrome" npm run pdf
```

> **Ao criar uma página nova**, inclua o arquivo em `CHAPTERS` e rode `npm run pdf`. Sem isso, a página entra no site mas fica de fora do PDF.

## Publicação

O projeto `documentacao-averbgo` na Vercel está conectado a este repositório: **todo push na `main` publica em produção automaticamente**. Pull requests ganham deployment de preview.

Publicação manual, quando necessário:

```bash
npx vercel deploy --prod
```

## Convenções do conteúdo

- Português do Brasil, tratando o leitor como desenvolvedor de fora da empresa.
- Descrever o comportamento **atual** da API, incluindo inconsistências conhecidas — sinalizadas em blocos `:::caution` para que ninguém codifique contra uma suposição errada.
- Nomes de campos sempre como a API os devolve (`emitentes`, `endorsement`, `antts`), mesmo quando o termo do texto for outro.
- Exemplos vindos de respostas reais, com CNPJs, chaves e identificadores mascarados.

## Suporte

Dúvidas de integração: **sac@averbgo.com.br**
