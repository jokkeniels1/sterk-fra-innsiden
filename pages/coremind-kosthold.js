import { useState, useRef, useEffect } from 'react';
import { generatePDF } from '../utils/pdfGenerator';
import { jsPDF } from 'jspdf';
import Head from 'next/head';
import Link from 'next/link';

export default function CoreMindKosthold() {
  const [formData, setFormData] = useState({
    alder: '',
    kjonn: '',
    hoyde: '',
    vekt: '',
    aktivitetsniva: '',
    mal: [],
    allergier: [],
    preferanser: [],
    maaltider: '3',
    snacks: '2',
    koking: 'enkel',
    budsjett: 'moderat'
  });

  const [loading, setLoading] = useState(false);
  const [program, setProgram] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const chatEndRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && (name === 'mal' || name === 'allergier' || name === 'preferanser')) {
      setFormData((prev) => ({
        ...prev,
        [name]: checked ? [...prev[name], value] : prev[name].filter((item) => item !== value),
      }));
    } else if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const generatePrompt = (data) => {
    return `Du er en ernæringsekspert. Lag et personlig kosthold basert på følgende informasjon:
Alder: ${data.alder}, Kjønn: ${data.kjonn}, Høyde: ${data.hoyde}, Vekt: ${data.vekt}
Aktivitetsnivå: ${data.aktivitetsniva}, Mål: ${data.mal.join(', ')}
Allergier: ${data.allergier.join(', ')}, Preferanser: ${data.preferanser.join(', ')}
Antall måltider: ${data.maaltider}, Antall snacks: ${data.snacks}
Kokekunnskap: ${data.koking}, Budsjett: ${data.budsjett}

Svar i HTML med kun <h1>-<h3>, <ul>, <li>, <p>. Ikke bruk <html>, <head> eller <body>.`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowDetailsPopup(true);
  };

  const handleGenerateProgram = async () => {
    setShowDetailsPopup(false);
    setLoading(true);
    setProgram('');
    setShowChat(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: generatePrompt(formData) }),
      });

      const data = await response.json();
      setProgram(data.result || 'Ingen respons.');
    } catch (error) {
      console.error(error);
      setProgram('Feil ved generering.');
    }

    setLoading(false);
  };

  const handleChatSubmit = async (question) => {
    if (!question.trim()) return;
    setChatInput('');
    
    setChatHistory((prev) => [...prev, { 
      question, 
      answer: '<div class="animate-pulse">AI-assistenten skriver...</div>',
      isLoading: true 
    }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Som en AI-assistent med ekspertise i ernæring og kosthold, vennligst svar på følgende spørsmål: ${question}`
        }),
      });

      if (!response.ok) throw new Error('Nettverksfeil');
      
      const data = await response.json();
      
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].answer = data.result;
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
      handleChatSubmit(chatInput);
    }
  };

  const handleGeneratePDF = async () => {
    const doc = generatePDF(program, 'Personlig Kosthold', formData);
    doc.save('kosthold.pdf');
  };

  const handleGeneratePDFWithJS = () => {
    if (!program) return;

    const doc = new jsPDF();
    const content = program.replace(/<[^>]*>/g, '');

    doc.setFontSize(16);
    doc.text('Personlig Kosthold', 20, 20);

    doc.setFontSize(12);
    doc.text(`Alder: ${formData.alder}`, 20, 30);
    doc.text(`Kjønn: ${formData.kjonn}`, 20, 40);
    doc.text(`Vekt: ${formData.vekt} kg`, 20, 50);
    doc.text(`Høyde: ${formData.hoyde} cm`, 20, 60);
    doc.text(`Aktivitetsnivå: ${formData.aktivitetsniva}`, 20, 70);
    doc.text(`Mål: ${formData.mal.join(', ')}`, 20, 80);
    doc.text(`Allergier: ${formData.allergier.join(', ')}`, 20, 90);
    doc.text(`Preferanser: ${formData.preferanser.join(', ')}`, 20, 100);
    doc.text(`Antall måltider: ${formData.maaltider}`, 20, 110);
    doc.text(`Antall snacks: ${formData.snacks}`, 20, 120);
    doc.text(`Kokekunnskap: ${formData.koking}`, 20, 130);
    doc.text(`Budsjett: ${formData.budsjett}`, 20, 140);

    doc.setFontSize(14);
    doc.text('Kosthold:', 20, 160);

    const splitText = doc.splitTextToSize(content, 170);
    doc.setFontSize(10);
    doc.text(splitText, 20, 170);

    doc.save('kosthold.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <Head>
        <title>CoreMind - Kosthold</title>
        <meta name="description" content="Profesjonelt kosthold med CoreMind" />
      </Head>

      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-teal-500 bg-clip-text text-transparent">Få ditt personlige kosthold</h1>
          <p className="text-gray-400">Fyll ut skjemaet under for å få et skreddersydd kosthold</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Chat Section */}
          <div className="bg-emerald-800/50 p-4 sm:p-6 rounded-xl shadow-lg border border-emerald-600">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 flex items-center">
              <span className="mr-2">🥗</span> Chat med Ernæringscoach
            </h2>
            
            <div className="bg-emerald-900/50 p-3 sm:p-4 rounded-lg max-h-[400px] sm:max-h-[500px] overflow-y-auto mb-4 scroll-smooth">
              {chatHistory.length === 0 ? (
                <div className="text-emerald-200 text-center">
                  <p className="mb-2 text-base sm:text-lg font-medium">Start en samtale med din ernæringscoach for å få personlig veiledning.</p>
                  <p className="text-emerald-300 text-sm sm:text-base">Du kan få hjelp med kosthold, måltidsplanlegging, og andre ernæringsrelaterte spørsmål.</p>
                </div>
              ) : (
                chatHistory.map((entry, idx) => (
                  <div key={idx} className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    {entry.question && (
                      <div className="flex items-start">
                        <div className="bg-emerald-800/60 p-2 sm:p-3 rounded-lg max-w-[85%] sm:max-w-[80%]">
                          <p className="font-semibold text-emerald-300 mb-1 text-sm sm:text-base">Du</p>
                          <p className="text-emerald-100 text-sm sm:text-base">{entry.question}</p>
                        </div>
                      </div>
                    )}
                    {(entry.answer || entry.isLoading) && (
                      <div className="flex items-start justify-end">
                        <div className="bg-emerald-700/60 p-2 sm:p-3 rounded-lg max-w-[85%] sm:max-w-[80%]">
                          <p className="font-semibold text-emerald-300 mb-1 text-sm sm:text-base">Ernæringscoach</p>
                          {entry.isLoading ? (
                            <p className="animate-pulse text-emerald-200 text-sm sm:text-base">Skriver...</p>
                          ) : (
                            <div className="prose prose-sm sm:prose prose-invert prose-p:text-emerald-100 prose-headings:text-emerald-200 prose-strong:text-emerald-200 prose-li:text-emerald-100 max-w-none" dangerouslySetInnerHTML={{ __html: entry.answer }} />
                          )}
                        </div>
                      </div>
                    )}
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
                placeholder="Still spørsmål om kosthold, ernæring eller matplaner..."
                className="flex-grow p-2 sm:p-3 rounded-lg bg-emerald-900/50 border border-emerald-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400 focus:outline-none resize-none text-emerald-100 placeholder-emerald-500 text-sm sm:text-base"
                rows="2"
              />
              <button
                onClick={() => handleChatSubmit(chatInput)}
                disabled={isLoading || !chatInput.trim()}
                className={`px-4 sm:px-6 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
                  isLoading || !chatInput.trim()
                    ? 'bg-emerald-700/50 text-emerald-400/50 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                Send
              </button>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-lg shadow-lg border border-zinc-700">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Kosthold Generator</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Alder</label>
                <input
                  type="number"
                  name="alder"
                  value={formData.alder}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Kjønn</label>
                <select
                  name="kjonn"
                  value={formData.kjonn}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-green-500"
                  required
                >
                  <option value="">Velg kjønn</option>
                  <option value="mann">Mann</option>
                  <option value="kvinne">Kvinne</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Høyde (cm)</label>
                <input
                  type="number"
                  name="hoyde"
                  value={formData.hoyde}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Vekt (kg)</label>
                <input
                  type="number"
                  name="vekt"
                  value={formData.vekt}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Aktivitetsnivå</label>
                <select
                  name="aktivitetsniva"
                  value={formData.aktivitetsniva}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-green-500"
                  required
                >
                  <option value="">Velg aktivitetsnivå</option>
                  <option value="sedentær">Sedentær</option>
                  <option value="lett aktiv">Lett aktiv</option>
                  <option value="moderat aktiv">Moderat aktiv</option>
                  <option value="veldig aktiv">Veldig aktiv</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded ${
                  loading
                    ? 'bg-green-500/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700'
                }`}
              >
                {loading ? 'Genererer...' : 'Generer kosthold'}
              </button>
            </form>
          </div>
        </div>

        {/* Results Section */}
        {program && (
          <div className="mt-6 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-lg shadow-lg border border-zinc-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-green-400">Ditt Kosthold</h2>
              <button
                onClick={handleGeneratePDFWithJS}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 rounded"
              >
                Last ned PDF
              </button>
            </div>
            <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: program }} />
          </div>
        )}
      </div>

      {/* Details Popup */}
      {showDetailsPopup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg p-6 max-w-md w-full shadow-xl border border-zinc-700">
            <h2 className="text-xl font-bold mb-4 text-green-400">Viktige detaljer før kosthold generering</h2>
            <p className="mb-4 text-gray-400">For å lage et optimalt kosthold, trenger vi noen viktige detaljer:</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Hva er ditt mål med kostholdet?</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="mal"
                      value="vektnedgang"
                      checked={formData.mal.includes('vektnedgang')}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span>Vektnedgang</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="mal"
                      value="vektokning"
                      checked={formData.mal.includes('vektokning')}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span>Vektøkning</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="mal"
                      value="vedlikehold"
                      checked={formData.mal.includes('vedlikehold')}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span>Vedlikehold av vekt</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="mal"
                      value="helse"
                      checked={formData.mal.includes('helse')}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span>Bedre helse</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Har du noen allergier eller intoleranser?</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="allergier"
                      value="laktose"
                      checked={formData.allergier.includes('laktose')}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span>Laktose</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="allergier"
                      value="gluten"
                      checked={formData.allergier.includes('gluten')}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span>Gluten</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="allergier"
                      value="nøtter"
                      checked={formData.allergier.includes('nøtter')}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span>Nøtter</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="allergier"
                      value="egg"
                      checked={formData.allergier.includes('egg')}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span>Egg</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Har du noen kostholdspreferanser?</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="preferanser"
                      value="vegetar"
                      checked={formData.preferanser.includes('vegetar')}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span>Vegetar</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="preferanser"
                      value="vegan"
                      checked={formData.preferanser.includes('vegan')}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span>Vegan</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="preferanser"
                      value="lavkarbo"
                      checked={formData.preferanser.includes('lavkarbo')}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span>Lavkarbo</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="preferanser"
                      value="palio"
                      checked={formData.preferanser.includes('palio')}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span>Palio</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Antall måltider per dag</label>
                <select
                  name="maaltider"
                  value={formData.maaltider}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-green-500"
                >
                  <option value="2">2 måltider</option>
                  <option value="3">3 måltider</option>
                  <option value="4">4 måltider</option>
                  <option value="5">5 måltider</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Antall snacks per dag</label>
                <select
                  name="snacks"
                  value={formData.snacks}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-green-500"
                >
                  <option value="0">Ingen snacks</option>
                  <option value="1">1 snack</option>
                  <option value="2">2 snacks</option>
                  <option value="3">3 snacks</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Kokekunnskap</label>
                <select
                  name="koking"
                  value={formData.koking}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-green-500"
                >
                  <option value="enkel">Enkel</option>
                  <option value="moderat">Moderat</option>
                  <option value="avansert">Avansert</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Budsjett</label>
                <select
                  name="budsjett"
                  value={formData.budsjett}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-green-500"
                >
                  <option value="lavt">Lavt</option>
                  <option value="moderat">Moderat</option>
                  <option value="høyt">Høyt</option>
                </select>
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
                onClick={handleGenerateProgram} 
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 rounded"
              >
                Generer kosthold
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 