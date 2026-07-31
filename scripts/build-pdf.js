/**
 * Gera o manual em PDF a partir das mesmas páginas que alimentam o site.
 *
 *   npm run pdf
 *
 * Saída: static/manual/Manual-Integracao-API-AverbGo.pdf
 *
 * Requer um Chrome ou Edge instalado. Se estiver em caminho fora do padrão,
 * aponte com a variável de ambiente PUPPETEER_EXECUTABLE_PATH.
 */
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const puppeteer = require('puppeteer-core');

const ROOT = path.join(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const LOGO = path.join(ROOT, 'static', 'img', 'averbgo.png');
const OUT_PDF = path.join(ROOT, 'static', 'manual', 'Manual-Integracao-API-AverbGo.pdf');
const OUT_HTML = path.join(ROOT, '.docusaurus', 'manual-pdf.html');

const VERSAO = '2.0';
const DATA = 'Julho de 2026';

/** Ordem dos capítulos no PDF. Ao criar uma página nova, inclua aqui. */
const CHAPTERS = [
  'intro.md',
  'ambientes.md',
  'autenticacao.md',
  'enviar-xml/request.mdx',
  'enviar-xml/tags-extras.md',
  'enviar-xml/rcv.md',
  'enviar-xml/documento-minimo-rcv.md',
  'retornos/visao-geral.md',
  'retornos/multi-hierarquia.md',
  'retornos/produtos.md',
  'retornos/averbacao.md',
  'retornos/mdfe.md',
  'retornos/eventos.md',
  'retornos/erros.md',
  'guia-implementacao.md',
  'exemplos.md',
  'suporte.md',
];

const ADM_LABEL = {
  info: 'Informação',
  tip: 'Dica',
  caution: 'Atenção',
  warning: 'Atenção',
  danger: 'Importante',
  note: 'Nota',
};

const CHROME_PATHS = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

function acharNavegador() {
  const encontrado = CHROME_PATHS.find((p) => fs.existsSync(p));
  if (!encontrado) {
    throw new Error(
      'Nenhum Chrome/Edge encontrado. Instale um deles ou defina PUPPETEER_EXECUTABLE_PATH.'
    );
  }
  return encontrado;
}

const slug = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function stripFrontMatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { body: src, meta: {} };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].replace(/^['"]|['"]$/g, '');
  }
  return { body: src.slice(m[0].length), meta };
}

/** Converte admonitions do Docusaurus (::: tipo) em blocos HTML. */
function admonitions(src) {
  const out = [];
  const abertos = [];
  for (const line of src.split(/\r?\n/)) {
    const open = line.match(/^:::(\w+)(?:\s+(.*))?\s*$/);
    if (open) {
      const tipo = open[1];
      const titulo = (open[2] || ADM_LABEL[tipo] || tipo).trim();
      out.push('', `<div class="adm adm-${tipo}"><p class="adm-title">${titulo}</p>`, '');
      abertos.push(tipo);
      continue;
    }
    if (/^:::\s*$/.test(line) && abertos.length) {
      abertos.pop();
      out.push('', '</div>', '');
      continue;
    }
    out.push(line);
  }
  return out.join('\n');
}

const fileAnchor = (f) => 'cap-' + slug(f.replace(/\.(md|mdx)$/, '').replace(/\//g, '-'));

/** Links entre páginas viram âncoras internas do PDF. */
function rewriteLinks(src, currentFile) {
  return src.replace(/\]\((\.{1,2}\/[^)\s]+?\.mdx?)(#[^)]*)?\)/g, (all, rel) => {
    const alvo = path.posix.normalize(path.posix.join(path.posix.dirname(currentFile), rel));
    return '](#' + fileAnchor(alvo) + ')';
  });
}

function montarCapitulos() {
  return CHAPTERS.map((file, i) => {
    const caminho = path.join(DOCS, file);
    if (!fs.existsSync(caminho)) {
      throw new Error(`Capítulo listado em CHAPTERS não existe: docs/${file}`);
    }
    const { body, meta } = stripFrontMatter(fs.readFileSync(caminho, 'utf8'));
    const preparado = admonitions(rewriteLinks(body, file));

    const secoes = [];
    const renderer = new marked.Renderer();
    renderer.heading = function (text, level) {
      const plano = String(text).replace(/<[^>]+>/g, '');
      if (level === 1) return `<h1 class="chapter" id="${fileAnchor(file)}">${text}</h1>`;
      const id = fileAnchor(file) + '--' + slug(plano);
      if (level === 2) secoes.push({ id, text: plano });
      return `<h${level} id="${id}">${text}</h${level}>`;
    };

    return {
      numero: i + 1,
      title: meta.title || file,
      anchor: fileAnchor(file),
      html: marked.parse(preparado, { renderer, gfm: true }),
      secoes,
    };
  });
}

function montarHtml(capitulos) {
  const logo = 'data:image/png;base64,' + fs.readFileSync(LOGO).toString('base64');

  const sumario = capitulos
    .map(
      (c) => `
  <li class="toc-chapter">
    <a href="#${c.anchor}"><span class="toc-num">${c.numero}</span><span class="toc-title">${c.title}</span></a>
    ${c.secoes.length ? `<ul>${c.secoes.map((s) => `<li><a href="#${s.id}">${s.text}</a></li>`).join('')}</ul>` : ''}
  </li>`
    )
    .join('');

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Manual de Integração — API AverbGo</title>
<style>
  :root {
    --turq: #17d6c8; --blue: #2b8cf0; --violet: #5b2ff0;
    --ink: #16202b; --muted: #5c6b7a; --line: #dde5ec; --bg-soft: #f5f8fb;
  }
  @page { size: A4; margin: 20mm 16mm 18mm 16mm; }
  @page :first { margin: 0; }
  * { box-sizing: border-box; }
  body {
    font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    color: var(--ink); font-size: 10.2pt; line-height: 1.55; margin: 0;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }

  .cover { position: relative; height: 297mm; padding: 34mm 22mm 20mm; page-break-after: always; overflow: hidden; }
  .cover::before {
    content: ""; position: absolute; inset: 0 0 auto 0; height: 12mm;
    background: linear-gradient(90deg, var(--turq), var(--blue) 55%, var(--violet));
  }
  .cover-logo { width: 30mm; height: auto; margin-bottom: 14mm; }
  .cover h1 { font-size: 30pt; line-height: 1.15; margin: 0 0 4mm; letter-spacing: -0.4pt; }
  .cover h2 { font-size: 15pt; font-weight: 500; color: var(--muted); margin: 0 0 16mm; }
  .cover .rule { width: 46mm; height: 3px; background: linear-gradient(90deg, var(--turq), var(--violet)); margin-bottom: 12mm; }
  .cover dl { display: grid; grid-template-columns: 34mm 1fr; gap: 3mm 0; font-size: 10pt; margin: 0; }
  .cover dt { color: var(--muted); }
  .cover dd { margin: 0; font-weight: 600; }
  .cover-foot { position: absolute; left: 22mm; right: 22mm; bottom: 18mm; font-size: 9pt; color: var(--muted);
                border-top: 1px solid var(--line); padding-top: 4mm; display: flex; justify-content: space-between; }

  .toc { page-break-after: always; }
  .toc h1 { font-size: 20pt; margin: 0 0 8mm; }
  .toc ol { list-style: none; padding: 0; margin: 0; }
  .toc a { text-decoration: none; color: var(--ink); }
  .toc-chapter { margin-bottom: 4mm; break-inside: avoid; }
  .toc-chapter > a { display: flex; gap: 5mm; font-weight: 650; font-size: 11pt; align-items: baseline; }
  .toc-num { color: var(--blue); min-width: 7mm; }
  .toc-chapter ul { list-style: none; margin: 1.5mm 0 0 12mm; padding: 0; column-count: 2; column-gap: 8mm; }
  .toc-chapter ul li { font-size: 8.8pt; color: var(--muted); break-inside: avoid; margin-bottom: 0.8mm; }
  .toc-chapter ul a { color: var(--muted); }

  main { counter-reset: chapter; }
  h1.chapter {
    counter-increment: chapter; page-break-before: always; font-size: 19pt; margin: 0 0 6mm;
    padding-bottom: 3mm; border-bottom: 2px solid var(--line); letter-spacing: -0.2pt;
  }
  h1.chapter::before { content: counter(chapter); display: inline-block; min-width: 11mm; color: var(--blue); font-weight: 700; }
  h2 { font-size: 13pt; margin: 8mm 0 3mm; padding-left: 3mm; border-left: 3px solid var(--turq); page-break-after: avoid; }
  h3 { font-size: 11pt; margin: 6mm 0 2mm; color: #24384a; page-break-after: avoid; }
  p { margin: 0 0 3mm; }
  a { color: var(--blue); }
  strong { font-weight: 650; }
  ul, ol { margin: 0 0 3mm; padding-left: 6mm; }
  li { margin-bottom: 1mm; }
  hr { border: 0; border-top: 1px solid var(--line); margin: 6mm 0; }
  input[type=checkbox] { margin-right: 2mm; }

  code { font-family: "Cascadia Mono", Consolas, "Courier New", monospace; font-size: 8.6pt;
         background: var(--bg-soft); border: 1px solid var(--line); border-radius: 3px; padding: 0.3mm 1.2mm; }
  pre { background: #0f1b26; color: #e6f1f7; border-radius: 5px; padding: 3.5mm 4mm; overflow: hidden;
        font-size: 8.1pt; line-height: 1.45; margin: 0 0 4mm; page-break-inside: avoid; white-space: pre-wrap; word-break: break-word; }
  pre code { background: none; border: 0; color: inherit; font-size: inherit; padding: 0; }

  table { width: 100%; border-collapse: collapse; margin: 0 0 4mm; font-size: 8.8pt; page-break-inside: avoid; }
  thead th { background: var(--bg-soft); text-align: left; font-weight: 650; border-bottom: 2px solid var(--line); }
  th, td { padding: 1.8mm 2.4mm; border-bottom: 1px solid var(--line); vertical-align: top; }
  td code { font-size: 8.1pt; white-space: nowrap; }
  tbody tr:nth-child(even) { background: #fafcfe; }

  .adm { border-left: 3px solid var(--blue); background: var(--bg-soft); border-radius: 0 4px 4px 0;
         padding: 3mm 4mm 1.5mm; margin: 0 0 4mm; page-break-inside: avoid; }
  .adm .adm-title { font-weight: 700; font-size: 9.2pt; margin: 0 0 1.5mm; color: var(--blue); }
  .adm p:last-child, .adm ul:last-child, .adm table:last-child { margin-bottom: 2mm; }
  .adm-caution, .adm-warning { border-left-color: #e08600; background: #fff8ee; }
  .adm-caution .adm-title, .adm-warning .adm-title { color: #b96a00; }
  .adm-danger { border-left-color: #d2323c; background: #fff2f3; }
  .adm-danger .adm-title { color: #b3242d; }
  .adm-tip { border-left-color: #12b39c; background: #f0fbf8; }
  .adm-tip .adm-title { color: #0d8c7a; }
</style>
</head>
<body>

<section class="cover">
  <img class="cover-logo" src="${logo}" alt="AverbGo">
  <h1>Manual de Integração</h1>
  <h2>API de Averbação AverbGo</h2>
  <div class="rule"></div>
  <dl>
    <dt>Versão</dt><dd>${VERSAO}</dd>
    <dt>Data</dt><dd>${DATA}</dd>
    <dt>Público</dt><dd>Equipes de desenvolvimento de TMS, ERP e emissores fiscais</dd>
    <dt>Ambientes</dt><dd>api.averbgo.com.br &nbsp;·&nbsp; api.qa.averbgo.com.br</dd>
  </dl>
  <div class="cover-foot">
    <span>AverbGo — averbação de seguro de cargas</span>
    <span>sac@averbgo.com.br</span>
  </div>
</section>

<section class="toc">
  <h1>Sumário</h1>
  <ol>${sumario}</ol>
</section>

<main>
${capitulos.map((c) => `<article>${c.html}</article>`).join('\n')}
</main>

</body>
</html>`;
}

(async () => {
  const capitulos = montarCapitulos();
  const html = montarHtml(capitulos);

  fs.mkdirSync(path.dirname(OUT_HTML), { recursive: true });
  fs.mkdirSync(path.dirname(OUT_PDF), { recursive: true });
  fs.writeFileSync(OUT_HTML, html, 'utf8');

  const browser = await puppeteer.launch({
    executablePath: acharNavegador(),
    args: ['--no-sandbox', '--font-render-hinting=none'],
  });
  const page = await browser.newPage();
  await page.goto('file:///' + OUT_HTML.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });

  const opts = {
    path: OUT_PDF,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `<div style="width:100%;font-size:7pt;color:#5c6b7a;padding:0 16mm;
        font-family:'Segoe UI',Arial,sans-serif;display:flex;justify-content:space-between;">
        <span>Manual de Integração — API de Averbação AverbGo · v${VERSAO}</span>
        <span class="pageNumber"></span></div>`,
    margin: { top: '20mm', bottom: '18mm', left: '16mm', right: '16mm' },
  };

  try {
    await page.pdf({ ...opts, outline: true });
  } catch (e) {
    // versões antigas do puppeteer não suportam bookmarks
    await page.pdf(opts);
  }

  await browser.close();

  const kb = Math.round(fs.statSync(OUT_PDF).size / 1024);
  console.log(`PDF gerado: ${path.relative(ROOT, OUT_PDF)} (${kb} KB, ${capitulos.length} capítulos)`);
})();
