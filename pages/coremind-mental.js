import { useState, useRef, useEffect } from 'react';

export default function MentalStyrke() {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('øvelser');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    const question = chatInput;
    setChatInput('');
    
    // Add the question immediately to the chat history
    setChatHistory((prev) => [...prev, { question, answer: null, isLoading: true }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Du er en profesjonell mental trener. Gi støttende og reflekterte svar i HTML (<p>, <h2>, <ul>) på:\n"${question}"`
        }),
      });

      const data = await response.json();
      
      // Update the chat history with the answer
      setChatHistory((prev) => 
        prev.map((entry, index) => 
          index === prev.length - 1 
            ? { ...entry, answer: data.result || 'Ingen svar.', isLoading: false } 
            : entry
        )
      );
    } catch (err) {
      // Update with error message
      setChatHistory((prev) => 
        prev.map((entry, index) => 
          index === prev.length - 1 
            ? { ...entry, answer: 'Feil ved kontakt med AI.', isLoading: false } 
            : entry
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 text-white p-4 sm:p-6 pt-16 sm:pt-20">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">CoreMind – Mental Styrketrening</h1>
          <p className="text-lg sm:text-xl text-indigo-200">
            Bli kjent med tankene dine, tren fokuset og bygg mental robusthet
          </p>
        </header>

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-indigo-500 mb-6 sm:mb-8">
          <button 
            className={`py-2 px-4 sm:py-3 sm:px-6 font-medium text-sm sm:text-base ${activeTab === 'øvelser' ? 'text-indigo-300 border-b-2 border-indigo-300' : 'text-indigo-100'}`}
            onClick={() => setActiveTab('øvelser')}
          >
            Øvelser
          </button>
          <button 
            className={`py-2 px-4 sm:py-3 sm:px-6 font-medium text-sm sm:text-base ${activeTab === 'teknikk' ? 'text-indigo-300 border-b-2 border-indigo-300' : 'text-indigo-100'}`}
            onClick={() => setActiveTab('teknikk')}
          >
            Teknikker
          </button>
          <button 
            className={`py-2 px-4 sm:py-3 sm:px-6 font-medium text-sm sm:text-base ${activeTab === 'chat' ? 'text-indigo-300 border-b-2 border-indigo-300' : 'text-indigo-100'}`}
            onClick={() => setActiveTab('chat')}
          >
            Chat med Coach
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'øvelser' && (
          <div className="space-y-6 sm:space-y-8">
            <section className="bg-indigo-800/50 p-4 sm:p-6 rounded-xl shadow-lg">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 flex items-center">
                <span className="mr-2">🧘</span> Pustøvelser
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-indigo-900/50 p-3 sm:p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">4-7-8 Pusteteknikk</h3>
                  <p className="mb-2 text-sm sm:text-base">En effektiv teknikk for å redusere angst og forbedre søvnkvalitet.</p>
                  <ol className="list-decimal ml-5 space-y-1 text-sm sm:text-base">
                    <li>Pust ut fullstendig gjennom munnen</li>
                    <li>Lukk munnen og pust inn gjennom nesen (tell til 4)</li>
                    <li>Hold pusten (tell til 7)</li>
                    <li>Pust ut gjennom munnen (tell til 8)</li>
                    <li>Gjenta 4 ganger</li>
                  </ol>
                </div>
                <div className="bg-indigo-900/50 p-3 sm:p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Diafragmepusting</h3>
                  <p className="mb-2 text-sm sm:text-base">Stimulerer parasympatisk nervesystem for å redusere stress.</p>
                  <ol className="list-decimal ml-5 space-y-1 text-sm sm:text-base">
                    <li>Legg en hånd på brystet og en på magen</li>
                    <li>Pust inn dypt gjennom nesen (5 sekunder)</li>
                    <li>Føl at magen hever seg, ikke brystet</li>
                    <li>Pust ut langsomt gjennom munnen (5 sekunder)</li>
                    <li>Gjenta 10 ganger</li>
                  </ol>
                </div>
              </div>
            </section>

            <section className="bg-indigo-800/50 p-4 sm:p-6 rounded-xl shadow-lg">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 flex items-center">
                <span className="mr-2">🧠</span> Meditasjon og Fokus
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-indigo-900/50 p-3 sm:p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Kroppsscanning</h3>
                  <p className="mb-2 text-sm sm:text-base">En teknikk for å øke kroppsbevissthet og redusere spenning.</p>
                  <ol className="list-decimal ml-5 space-y-1 text-sm sm:text-base">
                    <li>Finn en behagelig stilling (sitt eller ligg)</li>
                    <li>Fokuser på pusten din i 1 minutt</li>
                    <li>Før oppmerksomheten til tærne, føl spenninger</li>
                    <li>Beveg oppover kroppen, område for område</li>
                    <li>Slapp av spenninger når du oppdager dem</li>
                    <li>Fullfør med å fokusere på hele kroppen</li>
                  </ol>
                </div>
                <div className="bg-indigo-900/50 p-3 sm:p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Fokusert Oppmerksomhet</h3>
                  <p className="mb-2 text-sm sm:text-base">Trener sinnet til å holde fokus på ett objekt.</p>
                  <ol className="list-decimal ml-5 space-y-1 text-sm sm:text-base">
                    <li>Velg et fokusobjekt (pust, lyd, eller visuelt objekt)</li>
                    <li>Sett en timer på 5 minutter</li>
                    <li>Fokuser på objektet uten avbrudd</li>
                    <li>Når tankene vandrer, merk det og vend tilbake</li>
                    <li>Øk gradvis tiden til 10-15 minutter</li>
                  </ol>
                </div>
              </div>
            </section>

            <section className="bg-indigo-800/50 p-4 sm:p-6 rounded-xl shadow-lg">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 flex items-center">
                <span className="mr-2">💪</span> Mental Styrke
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-indigo-900/50 p-3 sm:p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Visualisering</h3>
                  <p className="mb-2 text-sm sm:text-base">Bruk mental trening for å forbedre ytelse og redusere angst.</p>
                  <ol className="list-decimal ml-5 space-y-1 text-sm sm:text-base">
                    <li>Velg en situasjon du ønsker å forbedre</li>
                    <li>Finn et rolig sted og lukk øynene</li>
                    <li>Se for deg situasjonen i detalj (bilder, lyder, følelser)</li>
                    <li>Fokuser på positive utfall og suksess</li>
                    <li>Øv regelmessig, minst 5 minutter om dagen</li>
                  </ol>
                </div>
                <div className="bg-indigo-900/50 p-3 sm:p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Selvtalk</h3>
                  <p className="mb-2 text-sm sm:text-base">Endre negative tankemønstre til positive.</p>
                  <ol className="list-decimal ml-5 space-y-1 text-sm sm:text-base">
                    <li>Identifiser negative selvtalk-mønstre</li>
                    <li>Erstatt med positive, realistiske utsagn</li>
                    <li>Øv på å si "Jeg kan håndtere dette" i utfordrende situasjoner</li>
                    <li>Bruk tredjeperson (ditt navn) for å øke effekten</li>
                    <li>Gjenta positive utsagn regelmessig</li>
                  </ol>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'teknikk' && (
          <div className="space-y-8">
            <section className="bg-indigo-800/50 p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <span className="mr-2">🎯</span> Målsetting og Planlegging
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-indigo-900/50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">SMART-mål</h3>
                  <p className="mb-2">Sett mål som er spesifikke, målbare, oppnåelige, relevante og tidsbegrensede.</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li><strong>Spesifikk:</strong> Hva vil du oppnå? Hvor? Når? Hvordan?</li>
                    <li><strong>Målbare:</strong> Hvordan vil du vite at du har nådd målet?</li>
                    <li><strong>Oppnåelige:</strong> Er målet realistisk med dine ressurser?</li>
                    <li><strong>Relevant:</strong> Hvorfor er dette målet viktig for deg?</li>
                    <li><strong>Tidsbegrenset:</strong> Når vil du nå dette målet?</li>
                  </ul>
                </div>
                <div className="bg-indigo-900/50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Handlingsplan</h3>
                  <p className="mb-2">Bryt ned store mål i mindre, håndterbare steg.</p>
                  <ol className="list-decimal ml-5 space-y-1">
                    <li>Definer ditt endelige mål</li>
                    <li>Identifiser 3-5 hovedsteg for å nå målet</li>
                    <li>For hvert hovedsteg, list opp 3-5 mindre handlinger</li>
                    <li>Tildel tidsfrister til hver handling</li>
                    <li>Vurder fremgang regelmessig og juster etter behov</li>
                  </ol>
                </div>
              </div>
            </section>

            <section className="bg-indigo-800/50 p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <span className="mr-2">🛡️</span> Stressmestring
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-indigo-900/50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Problemløsning</h3>
                  <p className="mb-2">Systematisk tilnærming til å håndtere utfordringer.</p>
                  <ol className="list-decimal ml-5 space-y-1">
                    <li>Definer problemet tydelig</li>
                    <li>Generer minst 5 mulige løsninger</li>
                    <li>Vurder for- og ulemper ved hver løsning</li>
                    <li>Velg den beste løsningen</li>
                    <li>Lag en handlingsplan</li>
                    <li>Utfør og evaluer resultatet</li>
                  </ol>
                </div>
                <div className="bg-indigo-900/50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Grensesetting</h3>
                  <p className="mb-2">Lær å sette og opprettholde sunne grenser.</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Identifiser dine verdier og behov</li>
                    <li>Kommuniser grenser tydelig og respektfullt</li>
                    <li>Øv på å si "nei" uten skyldfølelse</li>
                    <li>Prioriter tid for deg selv og dine behov</li>
                    <li>Vær konsistent i å opprettholde grenser</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-indigo-800/50 p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <span className="mr-2">🌟</span> Selvrefleksjon
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-indigo-900/50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Dagbokskriving</h3>
                  <p className="mb-2">En kraftig verktøy for å prosessere tanker og følelser.</p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>Skriv i 10-15 minutter hver dag</li>
                    <li>Fokuser på følelser og tanker, ikke bare hendelser</li>
                    <li>Spør deg selv "hvorfor" for å få dypere innsikt</li>
                    <li>Identifiser mønstre over tid</li>
                    <li>Feilretting er ikke viktig - la tankene flyte</li>
                  </ul>
                </div>
                <div className="bg-indigo-900/50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Takkemeldinger</h3>
                  <p className="mb-2">Øk velvære og positivitet gjennom takknemlighet.</p>
                  <ol className="list-decimal ml-5 space-y-1">
                    <li>Skriv ned 3 ting du er takknemlig for hver dag</li>
                    <li>Vær spesifikk om hvorfor du er takknemlig</li>
                    <li>Inkluder både store og små ting</li>
                    <li>Reflekter over hvordan disse tingene påvirker livet ditt</li>
                    <li>Del takknemlighet med andre når det passer</li>
                  </ol>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="bg-indigo-800/50 p-4 sm:p-6 rounded-xl shadow-lg">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 flex items-center">
              <span className="mr-2">💬</span> Chat med Mental Coach
            </h2>
            
            <div className="bg-indigo-900/50 p-3 sm:p-4 rounded-lg max-h-[400px] sm:max-h-[500px] overflow-y-auto mb-4 scroll-smooth">
              {chatHistory.length === 0 ? (
                <div className="text-indigo-200 text-center">
                  <p className="mb-2 text-base sm:text-lg font-medium">Start en samtale med din mentale coach for å få personlig veiledning.</p>
                  <p className="text-indigo-300 text-sm sm:text-base">Du kan få hjelp med mental trening, stressmestring, motivasjon og andre psykologiske aspekter av trening og personlig utvikling.</p>
                </div>
              ) : (
                chatHistory.map((entry, idx) => (
                  <div key={idx} className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div className="flex items-start">
                      <div className="bg-indigo-800/60 p-2 sm:p-3 rounded-lg max-w-[85%] sm:max-w-[80%]">
                        <p className="font-semibold text-indigo-300 mb-1 text-sm sm:text-base">Du</p>
                        <p className="text-indigo-100 text-sm sm:text-base">{entry.question}</p>
                      </div>
                    </div>
                    <div className="flex items-start justify-end">
                      <div className="bg-indigo-700/60 p-2 sm:p-3 rounded-lg max-w-[85%] sm:max-w-[80%]">
                        <p className="font-semibold text-indigo-300 mb-1 text-sm sm:text-base">Mental Coach</p>
                        {entry.isLoading ? (
                          <p className="animate-pulse text-indigo-200 text-sm sm:text-base">Skriver...</p>
                        ) : (
                          <div className="prose prose-sm sm:prose prose-invert prose-p:text-indigo-100 prose-headings:text-indigo-200 prose-strong:text-indigo-200 prose-li:text-indigo-100 max-w-none" dangerouslySetInnerHTML={{ __html: entry.answer }} />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="flex gap-2">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Skriv din melding her... (Trykk Enter for å sende, Shift+Enter for linjeskift)"
                className="flex-grow p-2 sm:p-3 rounded-lg bg-indigo-900/50 border border-indigo-600 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-none text-indigo-100 placeholder-indigo-500 text-sm sm:text-base"
                rows="2"
              />
              <button
                onClick={handleChatSubmit}
                disabled={isLoading || !chatInput.trim()}
                className={`px-4 sm:px-6 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                  isLoading || !chatInput.trim()
                    ? 'bg-indigo-700/50 text-indigo-400/50 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
