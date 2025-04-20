import { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';

export default function TreningKropp() {
  const [formData, setFormData] = useState({
    alder: '',
    kjonn: 'mann',
    vekt: '',
    hoyde: '',
    aktivitetsniva: 'moderat',
    mål: 'vedlikehold',
    utstyr: 'ingen',
    maksvekt: '',
    preferanser: '',
  });
  const [trainingPlan, setTrainingPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;
    const question = chatInput;
    setChatInput('');
    
    setChatHistory((prev) => [...prev, { 
      question, 
      answer: '<div class="animate-pulse">AI-treneren skriver...</div>',
      isLoading: true 
    }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Som en profesjonell personlig trener, vennligst svar på følgende spørsmål om trening: ${question}`
        }),
      });

      if (!response.ok) throw new Error('Nettverksfeil');
      
      const data = await response.json();
      
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].answer = data.response;
        newHistory[newHistory.length - 1].isLoading = false;
        return newHistory;
      });
    } catch (err) {
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].answer = '<div class="text-red-500">Beklager, kunne ikke hente svar. Prøv igjen.</div>';
        newHistory[newHistory.length - 1].isLoading = false;
        return newHistory;
      });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowDetailsPopup(true);
  };

  const handleGenerateTrainingPlan = async () => {
    setShowDetailsPopup(false);
    setLoading(true);
    setError(null);
    setShowChat(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generer et personlig treningsprogram basert på følgende data:
          Alder: ${formData.alder}
          Kjønn: ${formData.kjonn}
          Vekt: ${formData.vekt} kg
          Høyde: ${formData.hoyde} cm
          Aktivitetsnivå: ${formData.aktivitetsniva}
          Mål: ${formData.mål}
          Utstyr: ${formData.utstyr}
          Maksvekt: ${formData.maksvekt || 'Ikke spesifisert'}
          Preferanser: ${formData.preferanser || 'Ingen spesielle'}

          Inkluder:
          1. Ukentlig treningsprogram
          2. Øvelsesbeskrivelser
          3. Sett og repetisjoner
          4. Hvileperioder
          5. Progresjonsoppskrift
          6. Sikkerhetstips
          
          Formater svaret i HTML med <h2>, <p>, <ul>, <li> tags.`
        }),
      });

      const data = await response.json();
      setTrainingPlan(data.result);
    } catch (err) {
      setError('Det oppstod en feil ved generering av treningsprogram. Prøv igjen senere.');
      console.error('Feil ved generering av treningsprogram:', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!trainingPlan) return;

    const doc = new jsPDF();
    const content = trainingPlan.replace(/<[^>]*>/g, '');

    doc.setFontSize(16);
    doc.text('Personlig Treningsprogram', 20, 20);

    doc.setFontSize(12);
    doc.text(`Alder: ${formData.alder}`, 20, 30);
    doc.text(`Kjønn: ${formData.kjonn}`, 20, 40);
    doc.text(`Vekt: ${formData.vekt} kg`, 20, 50);
    doc.text(`Høyde: ${formData.hoyde} cm`, 20, 60);
    doc.text(`Aktivitetsnivå: ${formData.aktivitetsniva}`, 20, 70);
    doc.text(`Mål: ${formData.mål}`, 20, 80);
    doc.text(`Utstyr: ${formData.utstyr}`, 20, 90);
    doc.text(`Maksvekt: ${formData.maksvekt || 'Ikke spesifisert'}`, 20, 100);
    doc.text(`Preferanser: ${formData.preferanser || 'Ingen spesielle'}`, 20, 110);

    doc.setFontSize(14);
    doc.text('Treningsprogram:', 20, 130);

    const splitText = doc.splitTextToSize(content, 170);
    doc.setFontSize(10);
    doc.text(splitText, 20, 140);

    doc.save('treningsprogram.pdf');
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Få ditt personlige treningsprogram</h1>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Chat Section */}
          <div className="bg-zinc-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Chat med Personlig Trener</h2>
            {chatHistory.length === 0 ? (
              <div className="text-gray-400 text-center mb-4">
                <p className="mb-2">Start en samtale med treneren for å få personlig veiledning.</p>
                <p className="text-sm">Du kan spørre om trening, øvelser, eller få støtte med treningsutfordringer.</p>
              </div>
            ) : (
              <div className="bg-zinc-800 rounded p-4 h-80 overflow-y-auto mb-4">
                {chatHistory.map((entry, idx) => (
                  <div key={idx} className="mb-4">
                    <div className="mb-2">
                      <p className="text-gray-400">Du:</p>
                      <p>{entry.question}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">AI-trener:</p>
                      <div dangerouslySetInnerHTML={{ __html: entry.answer }} />
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}

            <div className="flex gap-2">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Skriv et spørsmål og trykk Enter (Shift+Enter for linjeskift)"
                className="flex-grow bg-zinc-800 border border-zinc-700 rounded p-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                rows="2"
              />
              <button
                onClick={handleChatSubmit}
                disabled={isLoading || !chatInput.trim()}
                className={`px-4 py-2 rounded ${
                  isLoading || !chatInput.trim()
                    ? 'bg-blue-500/50 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                Send
              </button>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-zinc-900 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Din Profil</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Alder</label>
                <input
                  type="number"
                  name="alder"
                  value={formData.alder}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Kjønn</label>
                <select
                  name="kjonn"
                  value={formData.kjonn}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="mann">Mann</option>
                  <option value="kvinne">Kvinne</option>
                  <option value="annet">Annet</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Høyde (cm)</label>
                <input
                  type="number"
                  name="hoyde"
                  value={formData.hoyde}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Vekt (kg)</label>
                <input
                  type="number"
                  name="vekt"
                  value={formData.vekt}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Treningsnivå</label>
                <select
                  name="aktivitetsniva"
                  value={formData.aktivitetsniva}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="sedentær">Sedentær (lite eller ingen trening)</option>
                  <option value="lett">Lett aktiv (1-3 dager/uke)</option>
                  <option value="moderat">Moderat aktiv (3-5 dager/uke)</option>
                  <option value="aktiv">Aktiv (6-7 dager/uke)</option>
                  <option value="veldig aktiv">Veldig aktiv (2x daglig)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded ${
                  loading
                    ? 'bg-blue-500/50 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {loading ? 'Genererer...' : 'Generer treningsprogram'}
              </button>
            </form>
          </div>
        </div>

        {/* Results Section */}
        {trainingPlan && (
          <div className="mt-6 bg-zinc-900 p-6 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Ditt Treningsprogram</h2>
              <button
                onClick={generatePDF}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded"
              >
                Last ned PDF
              </button>
            </div>
            <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: trainingPlan }} />
          </div>
        )}
      </div>

      {/* Details Popup */}
      {showDetailsPopup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Viktige detaljer før treningsprogram generering</h2>
            <p className="mb-4 text-gray-400">For å lage et optimalt treningsprogram, trenger vi noen viktige detaljer:</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Hva er ditt mål med treningen?</label>
                <select
                  name="mål"
                  value={formData.mål}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="vedlikehold">Vedlikeholde styrke</option>
                  <option value="styrke">Øke styrke</option>
                  <option value="muskeloppbygging">Muskeloppbygging</option>
                  <option value="utholdenhet">Bedre utholdenhet</option>
                  <option value="vektnedgang">Vektnedgang</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Hvilket utstyr har du tilgang til?</label>
                <select
                  name="utstyr"
                  value={formData.utstyr}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="ingen">Ingen utstyr</option>
                  <option value="hjemme">Hjemmetreningsutstyr</option>
                  <option value="studio">Treningsstudio</option>
                  <option value="full">Fullt utstyr</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Maksimal vekt du kan løfte (kg)</label>
                <input
                  type="number"
                  name="maksvekt"
                  value={formData.maksvekt}
                  onChange={handleInputChange}
                  placeholder="F.eks. 100 kg i benkpress"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Har du noen treningspreferanser?</label>
                <textarea
                  name="preferanser"
                  value={formData.preferanser}
                  onChange={handleInputChange}
                  placeholder="F.eks. foretrekker øvre kropp, unngår knærbelastende øvelser"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                  rows="3"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setShowDetailsPopup(false)} 
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded"
              >
                Avbryt
              </button>
              <button 
                onClick={handleGenerateTrainingPlan} 
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded"
              >
                Generer program
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}