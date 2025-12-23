import StripToggle from "../components/StripToggle";
import PartnerStripToggle from "../components/PartnerStripToggle";
import TrackPlayer from "../components/TrackPlayer";
import { projects } from '../data/projects'

export default function Home() {
  
  // Use the projects defined in data/projects to populate the homepage strip
  const posters = projects.map((p) => ({
    slug: p.slug,
    title: p.title,
    year: p.year,
    tag: p.tag || 'Poster',
    image: p.image,
  }));

  const partners = [
    { name: 'Akeron Film', image: '/partners/akeron-film.png' },
    { name: 'Quinta Parete', image: '/partners/quinta-parete.png' },
    { name: 'Cassa Rurale AltoGarda Rovereto', image: '/partners/cassa-rurale-altogarda-rovereto.png' },
    { name: 'Fondazione Caritro', image: '/partners/fondazione-caritro.png' },
    { name: 'Fondazione Museo storico del Trentino', image: '/partners/fondazione-museo-storico-del-trentino.png' },
    { name: 'Cooperativa Amalia Guardini', image: '/partners/cooperativa-amalia-guardini.png' },
    { name: 'Comunità della Vallagarina', image: '/partners/comunit-della-vallagarina.png' },
    { name: 'Comune di Soave', image: '/partners/comune-di-soave.png' },
    { name: 'Comune di Rovereto', image: '/partners/comune-di-rovereto.png' },
    { name: 'MITAG Museo Storico Italiano della Guerra', image: '/partners/mitag-museo-storico-italiano-della-guerra.png' },
    { name: 'Pro Loco Soave', image: '/partners/pro-loco-soave.png' },
    { name: 'Etika Energia', image: '/partners/etika.png' },
    { name: 'Evotek', image: '/partners/evotek.png' },
    { name: 'In Tavola', image: '/partners/in-tavola.png' },
    { name: 'Movie Art Pro', image: '/partners/movie-art-pro.png' },
    { name: 'Marina di Venezia Camping Village', image: '/partners/marina-di-venezia-camping-village.png' },
  ];

  const selectedTracks = [
    {
      file: '/uploads/tracks/Selected Tracks/The Storm.mp3',
      context: 'The Storm',
      cover: '/uploads/copertina album/copertina claudio re.jpg',
    },
    {
      file: '/uploads/tracks/Selected Tracks/My Crown, My Ambition, My Queen.mp3',
      context: 'My Crown, My Ambition, My Queen',
      cover: '/uploads/copertina album/copertina claudio re.jpg',
    },
    {
      file: "/uploads/tracks/Selected Tracks/What If A Man Can't Regret.mp3",
      context: "What If A Man Can't Regret",
      cover: '/uploads/copertina album/copertina claudio re.jpg',
    },
    {
      file: '/uploads/tracks/Selected Tracks/The Spectre.mp3',
      context: 'The Spectre',
      cover: '/uploads/copertina album/copertina claudio re.jpg',
    },
    {
      file: '/uploads/tracks/Selected Tracks/Ending Titles.wav',
      context: 'Ending Titles',
      cover: '/uploads/copertina album/copertina soggetto obsoleto.jpg',
    },
    {
      file: '/uploads/tracks/Selected Tracks/Obsolete Subject And Past Times.wav',
      context: 'Obsolete Subject And Past Times',
      cover: '/uploads/copertina album/copertina soggetto obsoleto.jpg',
    },
    {
      file: '/uploads/tracks/Selected Tracks/Il mio ritmo.wav',
      context: 'Il mio ritmo',
      cover: "/uploads/copertina album/copertina l'appartamento.jpeg",
    },
    {
      file: '/uploads/tracks/Selected Tracks/The Mother’s Tale.wav',
      context: 'The Mother’s Tale',
      cover: '/uploads/copertina album/copertina la sonata del caos.jpg',
    },
    {
      file: '/uploads/tracks/Selected Tracks/Talia’s Farewell.wav',
      context: 'Talia’s Farewell',
      cover: '/uploads/copertina album/copertina la sonata del caos.jpg',
    },
    {
      file: '/uploads/tracks/Selected Tracks/Convivium.mp3',
      context: 'Convivium',
      cover: '/uploads/copertina album/copertina i veneti antichi.png',
    },
    {
      file: '/uploads/tracks/Selected Tracks/The Battle.wav',
      context: 'The Battle',
      cover: '/uploads/copertina album/copertina i veneti antichi.png',
    },
  ];

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 grain z-10" />
      <div className="pointer-events-none absolute -top-40 right-[-80px] h-96 w-96 rounded-full bg-[color:var(--accent)]/20 blur-3xl float z-10" />
      <div className="pointer-events-none absolute bottom-[-180px] left-[-120px] h-[30rem] w-[30rem] rounded-full bg-[color:var(--accent-2)]/70 blur-3xl z-10" />

      <main className="relative z-20 mx-auto flex min-h-screen max-w-7xl flex-col gap-12 px-6 py-12 lg:px-20">
        <header className="relative z-40">
          <div className="mx-auto max-w-7xl px-6 lg:px-20 text-center fade-in">
            <div className="hero-kicker">
              <span className="hero-kicker-line" aria-hidden="true" />
              <span className="hero-kicker-text">Original Scores · Sound Design · Narrative Music</span>
              <span className="hero-kicker-line" aria-hidden="true" />
            </div>
            <h1 className="display-name hero-title text-5xl leading-tight text-[color:var(--foreground)] sm:text-6xl lg:text-7xl">
              Pietro Montanti
            </h1>
            <p className="hero-subtitle mt-4 max-w-2xl mx-auto text-lg md:text-xl text-[color:var(--foreground)] font-semibold tracking-wide">
              Composer for Film and Media
            </p>
            <p className="hero-logline mt-3 max-w-2xl mx-auto text-sm md:text-base text-[color:var(--muted)]">
              Music that shapes character, tension, and emotional architecture.
            </p>
            <div className="hero-actions">
              <a href="#work-grid" className="hero-btn hero-btn-secondary">Film</a>
              <a href="#selected-tracks" className="hero-btn hero-btn-secondary">Selected Works</a>
              <a href="mailto:pietromontanticomposer@gmail.com?subject=Project%20Inquiry" className="hero-btn hero-btn-secondary">Contact</a>
            </div>
            <div className="hero-credits" aria-label="Credits">
              <span className="hero-credits-line" aria-hidden="true" />
              <p className="hero-credits-text">
                A PIETRO MONTANTI PRODUCTION  ORIGINAL SCORE AND SOUND DESIGN  COMPOSER FOR FILM AND MEDIA
                FEATURED WORKS INCLUDE  CLAUDIO RE  SOGGETTO OBSOLETO  I VENETI ANTICHI  I FOUND YOU
                L'APPARTAMENTO  LA SONATA DEL CAOS  MERIDIANA  FREAK SHAKESPEARE
                UNA PICCOLA, STUPIDA, INUTILE STORIA D'AMORE  FREE / FALL  POLVERE SOTTO AL TAPPETO
                NON C'E CASA IN PARADISO
              </p>
              <span className="hero-credits-line" aria-hidden="true" />
            </div>
          </div>
        </header>

        <section id="work" className="w-full overflow-visible">
          <span id="work-grid" className="sr-only" />
          <div className="scroll-shell">
            <div className="scroll-shell-label">
              Selected Film Posters
            </div>
            <StripToggle posters={posters} />
          </div>
        </section>

        <div className="grid gap-10">
          <section className="flex flex-col gap-8">
            <div className="card-shell overflow-hidden">
              <div className="bio-grid gap-6">
                <div className="bio-photo">
                  <img
                    src="/uploads/foto-sito.jpg"
                    alt="Portrait"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-8">
                  <h2 className="section-title mt-3 text-3xl text-[color:var(--foreground)]">
                    Pietro Montanti
                  </h2>
                  <p className="bio-text mt-4 text-sm leading-7 text-[color:var(--muted)]">
                    Pietro Montanti is a composer and music producer for film and visual media.
                  </p>
                  <p className="bio-text mt-3 text-sm leading-7 text-[color:var(--muted)]">
                    With a background in classical clarinet and composition from the Conservatory of Verona, complemented by studies in jazz language, modern harmony and audio production, he later specialized in Music for Visual Media at the Conservatory of Rovigo, with a strong focus on the practical relationship between music, editing and narrative structure.
                  </p>
                  <p className="bio-text mt-3 text-sm leading-7 text-[color:var(--muted)]">
                    He composes original scores for short films and theatre productions and collaborates with international production music libraries based in London and Los Angeles. His work is known for its high adaptability to very different narrative contexts, while maintaining a distinct and coherent musical identity across genres and formats.
                  </p>
                  <p className="bio-text mt-3 text-sm leading-7 text-[color:var(--muted)]">
                    Pietro’s approach is rooted in narrative function and timing. He works closely with the rhythm of the edit and the dramatic needs of each scene, shaping music that supports the story with precision, restraint and clarity. The goal is not to add music on top of the image, but to integrate it seamlessly into the visual language of the film.
                  </p>
                </div>
              </div>
            </div>

            <div className="section-divider" aria-hidden="true" />

            <section className="card-shell p-8">
              <div className="flex items-center justify-between">
                <h3 className="section-title text-2xl text-[color:var(--foreground)]">
                  Collaborations
                </h3>
              </div>
              <div className="partner-grid mt-6">
                <div className="partner-card">
                  <img src="/partners/akeron-film.png" alt="Akeron Film" loading="lazy" decoding="async" />
                </div>
                <div className="partner-card">
                  <img src="/partners/quinta-parete.png" alt="Quinta Parete" loading="lazy" decoding="async" />
                </div>
                <div className="partner-card">
                  <img src="/partners/cassa-rurale-altogarda-rovereto.png" alt="Cassa Rurale AltoGarda Rovereto" loading="lazy" decoding="async" />
                </div>
                <div className="partner-card">
                  <img src="/partners/fondazione-caritro.png" alt="Fondazione Caritro" loading="lazy" decoding="async" />
                </div>
                <div className="partner-card">
                  <img src="/partners/fondazione-museo-storico-del-trentino.png" alt="Fondazione Museo storico del Trentino" loading="lazy" decoding="async" />
                </div>
                <div className="partner-card">
                  <img src="/partners/cooperativa-amalia-guardini.png" alt="Cooperativa Amalia Guardini" loading="lazy" decoding="async" />
                </div>
                <div className="partner-card">
                  <img src="/partners/comunit-della-vallagarina.png" alt="Comunità della Vallagarina" loading="lazy" decoding="async" />
                </div>
                <div className="partner-card">
                  <img src="/partners/comune-di-soave.png" alt="Comune di Soave" loading="lazy" decoding="async" />
                </div>
                <div className="partner-card">
                  <img src="/partners/comune-di-rovereto.png" alt="Comune di Rovereto" loading="lazy" decoding="async" />
                </div>
                <div className="partner-card">
                  <img src="/partners/mitag-museo-storico-italiano-della-guerra.png" alt="MITAG Museo Storico Italiano della Guerra" loading="lazy" decoding="async" />
                </div>
                <div className="partner-card">
                  <img src="/partners/pro-loco-soave.png" alt="Pro Loco Soave" loading="lazy" decoding="async" />
                </div>
                <div className="partner-card">
                  <img src="/partners/etika.png" alt="Etika Energia" loading="lazy" decoding="async" />
                </div>
                <div className="partner-card">
                  <img src="/partners/evotek.png" alt="Evotek" loading="lazy" decoding="async" />
                </div>
                <div className="partner-card">
                  <img src="/partners/in-tavola.png" alt="In Tavola" loading="lazy" decoding="async" />
                </div>
                <div className="partner-card">
                  <img src="/partners/movie-art-pro.png" alt="Movie Art Pro" loading="lazy" decoding="async" />
                </div>
                <div className="partner-card">
                  <img src="/partners/marina-di-venezia-camping-village.png" alt="Marina di Venezia Camping Village" loading="lazy" decoding="async" />
                </div>
              </div>
            </section>

            <section id="selected-tracks" className="card-shell p-8">
              <div className="flex items-center justify-between">
                <h3 className="section-title text-2xl text-[color:var(--foreground)]">
                  Selected Tracks
                </h3>
              </div>
              <div className="mt-6">
                <TrackPlayer
                  tracks={selectedTracks}
                  coverSrc={selectedTracks[0]?.cover ?? '/uploads/foto-sito.jpg'}
                />
              </div>
            </section>



          </section>
        </div>
      </main>
    </div>
  );
}
