import { useState, useRef, useEffect } from 'react';

export default function MentalStyrke() {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [soundOn, setSoundOn] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    const question = chatInput;
    setChatInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Du er en profesjonell mental trener. Gi støttende og reflekterte svar i HTML (<p>, <h2>, <ul>) på:\n"${question}"`
        }),
      });

      const data = await response.json();
      setChatHistory((prev) => [...prev, { question, answer: data.result || 'Ingen svar.' }]);
    } catch (err) {
      setChatHistory((prev) => [...prev, { question, answer: 'Feil ved kontakt med AI.' }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  return (
    <div className="relative min-h-screen text-white overflow-hidden">

      {/* 🎥 Bakgrunnsvideo */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/videos/ro-natur.mp4" type="video/mp4" />
      </video>

      {/* 🔈 Bakgrunnslyd */}
      <audio
        src="/audio/rolig-natur.mp3"
        autoPlay
        loop
        volume={0.3}
        muted={!soundOn}
      />

      {/* 🔲 Mørkt filter */}
      <div className="fixed inset-0 bg-black/60 z-10" />

      {/* 🔘 Lydkontroll-knapp */}
      <button
        className="fixed top-4 right-4 z-30 bg-white/20 text-white text-sm px-3 py-1 rounded hover:bg-white/30"
        onClick={() => setSoundOn(!soundOn)}
      >
        {soundOn ? '🔊 Lyd av' : '🔈 Lyd på'}
      </button>

      {/* 🧠 Innhold */}
      <div className="relative z-20 p-6">
        <div className="max-w-3xl mx-auto space-y-10">

          <section>
            <h1 className="text-3xl font-bold mb-2 text-center">CoreMind – Mental styrketrening</h1>
            <p className="text-lg text-center italic">
              Bli kjent med tankene dine, tren fokuset og bygg mental robusthet – akkurat som du trener kroppen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">Daglige øvelser</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li><strong>1 min pust:</strong> Lukk øynene, pust dypt inn gjennom nesen (4 sek), hold (4 sek), pust ut (6 sek). Gjenta 5 ganger.</li>
              <li><strong>3 gode ting:</strong> Hva gikk bra i dag? Hva er du takknemlig for?</li>
              <li><strong>Visualiser ro:</strong> Se for deg et trygt sted du kan vende tilbake til i tankene.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2">Mål og mestring</h2>
            <p className="mb-2">Hva ønsker du å bli bedre på mentalt? Å sette mål gir retning og mening:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>“Jeg vil takle stress bedre på jobb.”</li>
              <li>“Jeg vil bli snillere med meg selv.”</li>
              <li>“Jeg vil tørre å si nei.”</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">💬 Snakk med CoreMind Coach</h2>
            <p className="mb-2 text-sm text-white/70">Har du et spørsmål, en bekymring – eller bare trenger et mentalt dytt?</p>

            <div className="bg-white/10 p-4 rounded h-64 overflow-y-auto space-y-4 text-sm">
              {chatHistory.map((entry, idx) => (
                <div key={idx}>
                  <p className="text-orange-300 font-semibold">🟠 Du:</p>
                  <p className="mb-1">{entry.question}</p>
                  <p className="text-green-300 font-semibold">🧠 CoreMind Coach:</p>
                  <div dangerouslySetInnerHTML={{ __html: entry.answer }} />
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <textarea
              className="w-full mt-4 p-2 rounded bg-gray-300 text-black"
              rows="2"
              placeholder="Skriv et spørsmål og trykk Enter (Shift+Enter for linjeskift)"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
