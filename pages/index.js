import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
          Få kropp og sinn i balanse
        </h1>
          <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto mb-12">
          Med CoreMind får du helhetlig veiledning innen fysisk trening, mental
          styrke og personlig kosthold – med støtte fra avansert AI.
        </p>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <Link href="/coremind-trening" className="group">
            <div className="card h-full transform transition-all duration-300 hover:scale-105 hover:shadow-glow">
              <div className="text-4xl mb-4 group-hover:animate-float">💪</div>
              <h3 className="text-xl font-semibold mb-2 text-primary-400">Fysisk trening</h3>
              <p className="text-gray-300">
              Få skreddersydde treningsprogrammer og tren smart med AI-treneren.
            </p>
          </div>
        </Link>

          <Link href="/coremind-mental" className="group">
            <div className="card h-full transform transition-all duration-300 hover:scale-105 hover:shadow-glow">
              <div className="text-4xl mb-4 group-hover:animate-float">🧠</div>
              <h3 className="text-xl font-semibold mb-2 text-primary-400">Mental styrke</h3>
              <p className="text-gray-300">
              Bygg fokus, ro og selvtillit med daglige øvelser og AI-coach.
            </p>
          </div>
        </Link>

          <Link href="/kosthold" className="group">
            <div className="card h-full transform transition-all duration-300 hover:scale-105 hover:shadow-glow">
              <div className="text-4xl mb-4 group-hover:animate-float">🍽️</div>
              <h3 className="text-xl font-semibold mb-2 text-primary-400">Kosthold</h3>
              <p className="text-gray-300">
              Spis smart. Få AI-baserte kostholdsråd tilpasset dine mål.
            </p>
          </div>
        </Link>

          <Link href="/drommetolkning" className="group">
            <div className="card h-full transform transition-all duration-300 hover:scale-105 hover:shadow-glow">
              <div className="text-4xl mb-4 group-hover:animate-float">💤</div>
              <h3 className="text-xl font-semibold mb-2 text-primary-400">Drømmetolkning</h3>
              <p className="text-gray-300">
              Få innsikt i drømmene dine. Symboltolking og AI-veiledet forståelse.
            </p>
          </div>
        </Link>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Klar til å starte din reise?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Velg din vei og la CoreMind guide deg mot en sterkere versjon av deg selv.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/coremind-trening" className="btn-primary">
              Start med trening
            </Link>
            <Link href="/coremind-mental" className="btn-secondary">
              Utforsk mental trening
            </Link>
          </div>
        </div>
      </section>

      <footer className="text-center text-sm text-gray-500 py-8">
        &copy; {new Date().getFullYear()} CoreMind. Alle rettigheter reservert.
      </footer>
    </div>
  );
}