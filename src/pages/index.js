import React from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import Layout from '@theme/Layout'
import HomepageFeatures from '@site/src/components/HomepageFeatures'

import styles from './index.module.css'

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <p className={styles.heroText}>
          Envie os XMLs emitidos pelo segurado e receba a averbação em tempo real.
        </p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs/intro">
            Começar a integrar
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/manual/Manual-Integracao-API-AverbGo.pdf"
          >
            Baixar o manual em PDF
          </Link>
        </div>
      </div>
    </header>
  )
}

export default function Home() {
  return (
    <Layout
      title="Manual de Integração"
      description="Manual de integração da API de averbação AverbGo: envio de XML, retornos, erros e guia de implementação."
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  )
}
