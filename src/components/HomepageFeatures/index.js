import React from 'react'
import clsx from 'clsx'
import Link from '@docusaurus/Link'
import styles from './styles.module.css'

const FeatureList = [
  {
    title: 'Envio de XML',
    to: '/docs/enviar-xml/request',
    description: (
      <>
        Um único endpoint recebe CT-e, NF-e, MDF-e, documentos "Outros" e os eventos de
        cancelamento e encerramento. Headers, corpo da requisição e exemplos em cURL, C#, Java e PHP.
      </>
    )
  },
  {
    title: 'Retornos da API',
    to: '/docs/retornos/visao-geral',
    description: (
      <>
        Os seis formatos de resposta documentados campo a campo — multiemitente, produtos,
        averbação, MDF-e e eventos —, com a árvore de decisão para consolidar o resultado.
      </>
    )
  },
  {
    title: 'Guia de implementação',
    to: '/docs/guia-implementacao',
    description: (
      <>
        Tratamento completo da resposta, política de retentativa, idempotência, sucesso parcial
        e checklist de homologação antes de subir para produção.
      </>
    )
  }
]

function Feature({ title, description, to }) {
  return (
    <div className={clsx('col col--4')}>
      <Link className={styles.card} to={to}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardText}>{description}</p>
        <span className={styles.cardLink}>Ver documentação →</span>
      </Link>
    </div>
  )
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
