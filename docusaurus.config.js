// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github')
const darkCodeTheme = require('prism-react-renderer/themes/dracula')

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'AverbGo',
  tagline: 'Manual de Integração — API de Averbação',
  url: 'https://documentacao-averbgo.vercel.app',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'averbgo', // Usually your GitHub org/user name.
  projectName: 'averbgo', // Usually your repo name.

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt']
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: 'docs'
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      })
    ]
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark'
      },
      navbar: {
        title: 'AverbGo',
        logo: {
          alt: 'AverbGo',
          src: 'img/logo.svg'
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Manual de Integração'
          },
          {
            to: '/manual/Manual-Integracao-API-AverbGo.pdf',
            label: 'PDF',
            position: 'right'
          },
          {
            href: 'https://averbgo.com.br/main/chaves',
            label: 'Portal',
            position: 'right'
          }
        ]
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Manual',
            items: [
              { label: 'Visão geral', to: '/docs/intro' },
              { label: 'Envio de XML', to: '/docs/enviar-xml/request' },
              { label: 'Retornos da API', to: '/docs/retornos/visao-geral' },
              { label: 'Guia de implementação', to: '/docs/guia-implementacao' }
            ]
          },
          {
            title: 'AverbGo',
            items: [
              { label: 'Portal', href: 'https://averbgo.com.br' },
              { label: 'Chaves de acesso', href: 'https://averbgo.com.br/main/chaves' },
              { label: 'Manual em PDF', to: '/manual/Manual-Integracao-API-AverbGo.pdf' }
            ]
          },
          {
            title: 'Suporte',
            items: [
              { label: 'sac@averbgo.com.br', href: 'mailto:sac@averbgo.com.br' },
              { label: 'Perguntas frequentes', to: '/docs/suporte' }
            ]
          }
        ],
        copyright: `Copyright © ${new Date().getFullYear()} AverbGo.`
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme
      }
    })
}

module.exports = config
