import Head from 'next/head';

export default function Om() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white">
      <Head>
        <title>Om CoreMind - Din personlige treningspartner</title>
        <meta name="description" content="Lær mer om CoreMind - din AI-drevne treningspartner for fysisk og mental styrke" />
      </Head>

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="card p-8 space-y-8">
          <h1 className="text-4xl font-bold text-center mb-8">Om CoreMind</h1>
          
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-primary-400">Vår Visjon</h2>
            <p className="text-lg leading-relaxed">
              CoreMind er en revolusjonerende plattform som kombinerer kunstig intelligens med ekspertise innen trening, 
              kosthold og mental styrke. Vårt mål er å gjøre profesjonell treningsveiledning tilgjengelig for alle, 
              tilpasset dine unike behov og mål.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-primary-400">Hva Vi Tilbyr</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card bg-white/5 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-3 text-secondary-400">Fysisk Trening</h3>
                <p>Personlige treningsprogrammer tilpasset ditt nivå, mål og tilgjengelig utstyr.</p>
              </div>
              <div className="card bg-white/5 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-3 text-secondary-400">Mental Styrke</h3>
                <p>Øvelser og teknikker for å bygge mental robusthet og fokus.</p>
              </div>
              <div className="card bg-white/5 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-3 text-secondary-400">Kosthold</h3>
                <p>Skreddersydde kostholdsplaner med handleliste og næringsberegninger.</p>
              </div>
              <div className="card bg-white/5 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-3 text-secondary-400">Drømmetolkning</h3>
                <p>Profesjonell analyse av drømmer for personlig innsikt og vekst.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-primary-400">Hvordan Det Fungerer</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">1</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Fyll Ut Din Profil</h3>
                  <p>Del dine mål, preferanser og treningsbakgrunn med oss.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">2</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Få Din Personlige Plan</h3>
                  <p>Motta et skreddersydd program basert på dine behov.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">3</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Følg og Juster</h3>
                  <p>Følg programmet ditt og juster etter behov med AI-støtte.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-primary-400">Vårt AI-Team</h2>
            <p className="text-lg leading-relaxed">
              CoreMind bruker avansert kunstig intelligens for å skape personlige treningsprogrammer. 
              Vår AI er trent på omfattende data fra treningsfaglige eksperter og kan tilpasse seg dine 
              unike behov og mål. Med kontinuerlig læring og forbedring, blir vår AI stadig bedre i 
              å hjelpe deg nå dine treningsmål.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-primary-400">Kontakt Oss</h2>
            <p className="text-lg leading-relaxed">
              Har du spørsmål eller ønsker du mer informasjon? Vi er her for å hjelpe deg på din 
              reise mot bedre helse og velvære.
            </p>
            <div className="flex justify-center space-x-4 mt-4">
              <a href="mailto:kontakt@coremind.no" className="btn-primary">
                Send E-post
              </a>
              <a href="https://twitter.com/coremind" className="btn-secondary">
                Twitter
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
