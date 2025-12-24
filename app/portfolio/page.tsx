import React from 'react'
import StripToggle from '../../components/StripToggle'
import { projects } from '../../data/projects'

export const metadata = {
  title: 'Portfolio',
}

export default function PortfolioPage() {
  return (
    <main style={{ padding: '2rem 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 className="headline" style={{ fontSize: '2.2rem', marginBottom: '1.25rem' }}>
          Portfolio
        </h1>

        {/* StripToggle provides a clean toggle between horizontal strip and grid */}
        <StripToggle posters={projects.map((p) => ({ slug: p.slug, title: p.title, year: p.year, tag: p.tag, image: p.image }))} />
      </div>
    </main>
  )
}
