import StripToggle from "../components/StripToggle";
import PartnerStripToggle from "../components/PartnerStripToggle";
import TrackPlayer from '../components/TrackPlayerClient';
import MediaPreload from "../components/MediaPreload";
import Image from 'next/image';
import { projects } from '../data/projects'

// Move arrays outside component to prevent recreation on every render
const posters = projects.map((p) => ({
  slug: p.slug,
  title: p.title,
  year: p.year,
  tag: p.tag || 'Poster',
  image: p.image,
}));

const partners = [
  { name: 'Akeron Film', image: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/partners/akeron_film.png' },
  { name: 'Cassa Rurale AltoGarda Rovereto', image: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/partners/cassa_rurale_alto_garda_rovereto.png' },
  { name: 'Fondazione Caritro', image: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/partners/fondazione_caritro.png' },
  { name: 'Fondazione Museo storico del Trentino', image: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/partners/fondazione_museo_storico_del_trentino.png' },
  { name: 'Cooperativa Amalia Guardini', image: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/partners/cooperativa_amalia_guardini.png' },
  { name: 'Comunità della Vallagarina', image: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/partners/comunita_della_vallagarina.png' },
  { name: 'Comune di Soave', image: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/partners/comune-di-soave.png' },
  { name: 'Comune di Rovereto', image: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/partners/comune_di_rovereto.png' },
  { name: 'Pro Loco Soave', image: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/partners/pro_loco_soave.png' },
  { name: 'Etika Energia', image: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/partners/etika.png' },
  { name: 'Evotek', image: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/partners/evotek.png' },
  { name: 'In Tavola', image: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/partners/in_tavola.png' },
  { name: 'Movie Art Pro', image: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/partners/movie_art_pro.png' },
  { name: 'Marina di Venezia Camping Village', image: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/partners/marina_di_venezia.png' },
];

const selectedTracks = [
  {
    file: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/tracks/selected-tracks/My-Crown-My-Ambition-My-Queen.mp3',
    context: 'My Crown, My Ambition, My Queen',
    cover: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20claudio%20re.webp',
  },
  {
    file: "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/tracks/selected-tracks/What-If-A-Man-Cant-Regret-alt.mp3",
    context: "What If A Man Can't Regret",
    cover: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20claudio%20re.webp',
  },
  {
    file: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/tracks/selected-tracks/The-Spectre.mp3',
    context: 'The Spectre',
    cover: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20claudio%20re.webp',
  },
  {
    file: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/tracks/selected-tracks/Ending-Titles.mp3',
    context: 'Ending Titles',
    cover: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20soggetto%20obsoleto.webp',
  },
  {
    file: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/tracks/selected-tracks/Obsolete-Subject-And-Past-Times.mp3',
    context: 'Obsolete Subject And Past Times',
    cover: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20soggetto%20obsoleto.webp',
  },
  {
    file: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/tracks/selected-tracks/Il-mio-ritmo.mp3',
    context: 'Il mio ritmo',
    cover: "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20l%27appartamento.webp",
  },
  {
    file: "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/tracks/selected-tracks/The-Mothers-Tale-alt.mp3",
    context: "The Mother's Tale",
    cover: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20la%20sonata%20del%20caos.webp',
  },
  {
    file: "https://4glkq64bdlmmple5.public.blob.vercel-storage.com/tracks/selected-tracks/Talias-Farewell-alt.mp3",
    context: "Talia's Farewell",
    cover: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20la%20sonata%20del%20caos.webp',
  },
  {
    file: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/tracks/selected-tracks/Convivium.mp3',
    context: 'Convivium',
    cover: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20i%20veneti%20antichi.webp',
  },
  {
    file: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/tracks/selected-tracks/The-Battle.mp3',
    context: 'The Battle',
    cover: 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/copertina%20album/copertina%20i%20veneti%20antichi.webp',
  },
];

export default function Home() {
  const preloadImages = [
    ...posters.map((p) => p.image).filter(Boolean) as string[],
    ...selectedTracks.map((t) => t.cover).filter(Boolean) as string[],
    ...partners.map((p) => p.image).filter(Boolean) as string[],
  ];

  return (
    <div className="relative min-h-screen">
      <MediaPreload images={preloadImages} />
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
                L&apos;APPARTAMENTO  LA SONATA DEL CAOS  MERIDIANA  FREAK SHAKESPEARE
                UNA PICCOLA, STUPIDA, INUTILE STORIA D&apos;AMORE  FREE / FALL  POLVERE SOTTO AL TAPPETO
                NON C&apos;E CASA IN PARADISO
              </p>
              <span className="hero-credits-line" aria-hidden="true" />
            </div>
          </div>
        </header>

        <section id="work" className="w-full overflow-visible">
          <span id="work-grid" className="sr-only" />
          <div className="scroll-shell">
            <div className="w-full flex justify-center">
              <h3 className="section-title text-2xl text-[color:var(--foreground)]">
                Selected Film Posters
              </h3>
            </div>
            <StripToggle posters={posters} />
          </div>
        </section>

        <div className="grid gap-10">
          <section className="flex flex-col gap-8">
            <div className="card-shell overflow-hidden">
              <div className="bio-grid gap-6">
                <div className="bio-photo relative">
                  <Image
                    src="https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/foto-sito.webp"
                    alt="Portrait"
                    fill
                    className="object-cover"
                    priority
                    fetchPriority="high"
                    decoding="async"
                    sizes="(max-width: 768px) 100vw, 50vw"
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

            <section className="w-full overflow-visible">
              <span id="collaborations" className="sr-only" />
              <div className="scroll-shell">
                <div className="w-full flex justify-center">
                  <h3 className="section-title text-2xl text-[color:var(--foreground)]">
                    Collaborations
                  </h3>
                </div>
                <PartnerStripToggle partners={partners} />
              </div>
            </section>

            <section id="selected-tracks" className="card-shell p-8">
              <div className="section-header flex items-center justify-between">
                <h3 className="section-title text-2xl text-[color:var(--foreground)]">
                  Selected Tracks
                </h3>
              </div>
              <div className="mt-6">
                <TrackPlayer
                  tracks={selectedTracks}
                  coverSrc={selectedTracks[0]?.cover ?? 'https://4glkq64bdlmmple5.public.blob.vercel-storage.com/optimized/uploads/foto-sito.webp'}
                />
              </div>
            </section>



          </section>
        </div>
      </main>
    </div>
  );
}
