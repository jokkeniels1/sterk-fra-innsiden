import { useState, useRef, useEffect } from 'react';
import { generatePDF } from '../utils/pdfGenerator';
import { jsPDF } from 'jspdf';
import Head from 'next/head';
import Link from 'next/link';

export default function CoreMindTrening() {
  const [formData, setFormData] = useState({
    alder: '',
    kjonn: '',
    hoyde: '',
    vekt: '',
    treningsniva: '',
    splitType: '3-split',
    mal: [],
    dager: '2',
    utstyr: [],
    oktTid: '20-30 min',
    inkluderMaksvekt: false,
    maksvekt: {
      benkpress: '',
      kneboy: '',
      markloft: '',
      militærpress: '',
      nedtrekk: '',
      hipthrust: '',
      bicepscurl: '',
      pushups: '',
      planke: ''
    }
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
    if (name.startsWith('maksvekt.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        maksvekt: {
          ...prev.maksvekt,
          [key]: value,
        },
      }));
    } else if (type === 'checkbox' && (name === 'mal' || name === 'utstyr')) {
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
    const maksvektTxt = data.inkluderMaksvekt
      ? `\n\nMaksvekt i øvelser:\n- Benkpress: ${data.maksvekt.benkpress}\n- Knebøy: ${data.maksvekt.kneboy}\n- Markløft: ${data.maksvekt.markloft}`
      : '';

    return `Du er en AI-trener. Lag et personlig ${data.splitType} treningsprogram for ${data.treningsniva}.
Alder: ${data.alder}, Kjønn: ${data.kjonn}, Høyde: ${data.hoyde}, Vekt: ${data.vekt}
Mål: ${data.mal.join(', ')}, Utstyr: ${data.utstyr.join(', ')}, Tid: ${data.oktTid}
${maksvektTxt}
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
    
    // Add the question immediately to the chat history
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
          message: `Som en AI-assistent med ekspertise i trening og fysisk aktivitet, vennligst svar på følgende spørsmål: ${question}`
        }),
      });

      if (!response.ok) throw new Error('Nettverksfeil');
      
      const data = await response.json();
      
      // Update the last message with the actual response
      setChatHistory(prev => {
        const newHistory = [...prev];
        newHistory[newHistory.length - 1].answer = data.result;
        newHistory[newHistory.length - 1].isLoading = false;
        return newHistory;
      });
    } catch (err) {
      // Update with error message
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
    const doc = generatePDF(program, 'Personlig Treningsprogram', formData);
    doc.save('treningsprogram.pdf');
  };

  const handleGeneratePDFWithJS = () => {
    if (!program) return;

    const doc = new jsPDF();
    const content = program.replace(/<[^>]*>/g, '');

    doc.setFontSize(16);
    doc.text('Personlig Treningsprogram', 20, 20);

    doc.setFontSize(12);
    doc.text(`Alder: ${formData.alder}`, 20, 30);
    doc.text(`Kjønn: ${formData.kjonn}`, 20, 40);
    doc.text(`Vekt: ${formData.vekt} kg`, 20, 50);
    doc.text(`Høyde: ${formData.hoyde} cm`, 20, 60);
    doc.text(`Treningsnivå: ${formData.treningsniva}`, 20, 70);
    doc.text(`Split: ${formData.splitType}`, 20, 80);
    doc.text(`Mål: ${formData.mal.join(', ')}`, 20, 90);
    doc.text(`Tid: ${formData.oktTid}`, 20, 100);
    doc.text(`Dager: ${formData.dager}`, 20, 110);
    doc.text(`Utstyr: ${formData.utstyr.join(', ')}`, 20, 120);
    if (formData.inkluderMaksvekt) {
      doc.text(`Maksvekt i øvelser:`, 20, 130);
      doc.text(`- Benkpress: ${formData.maksvekt.benkpress}`, 20, 140);
      doc.text(`- Knebøy: ${formData.maksvekt.kneboy}`, 20, 150);
      doc.text(`- Markløft: ${formData.maksvekt.markloft}`, 20, 160);
    }

    doc.setFontSize(14);
    doc.text('Treningsprogram:', 20, 180);

    const splitText = doc.splitTextToSize(content, 170);
    doc.setFontSize(10);
    doc.text(splitText, 20, 190);

    doc.save('treningsprogram.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <Head>
        <title>CoreMind - Fysisk Trening</title>
        <meta name="description" content="Profesjonell fysisk trening med CoreMind" />
      </Head>

      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Få ditt personlige treningsprogram</h1>
          <p className="text-gray-400">Fyll ut skjemaet under for å få et skreddersydd treningsprogram</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Chat Section */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-lg shadow-lg border border-zinc-700">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Chat med AI Treningsassistent</h2>
            {chatHistory.length === 0 ? (
              <div className="text-gray-400 text-center mb-4">
                <p className="mb-2">Start en samtale med AI-assistenten for å få personlig veiledning.</p>
                <p className="text-sm">Du kan spørre om trening, øvelser, eller få støtte med treningsutfordringer.</p>
              </div>
            ) : (
              <div className="bg-zinc-800/80 rounded p-4 h-80 overflow-y-auto mb-4 border border-zinc-700">
                {chatHistory.map((entry, idx) => (
                  <div key={idx} className="mb-4">
                    <div className="mb-2">
                      <p className="text-gray-400">Du:</p>
                      <p>{entry.question}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">AI-assistent:</p>
                      <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: entry.answer }} />
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
                onClick={() => handleChatSubmit(chatInput)}
                disabled={isLoading || !chatInput.trim()}
                className={`px-4 py-2 rounded ${
                  isLoading || !chatInput.trim()
                    ? 'bg-blue-500/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                }`}
              >
                Send
              </button>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-lg shadow-lg border border-zinc-700">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Treningsprogram Generator</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Alder</label>
                <input
                  type="number"
                  name="alder"
                  value={formData.alder}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Kjønn</label>
                <select
                  name="kjonn"
                  value={formData.kjonn}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
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
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block mb-1">Treningsnivå</label>
                <select
                  name="treningsniva"
                  value={formData.treningsniva}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Velg treningsnivå</option>
                  <option value="nybegynner">Nybegynner</option>
                  <option value="moderat">Moderat</option>
                  <option value="avansert">Avansert</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded ${
                  loading
                    ? 'bg-blue-500/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                }`}
              >
                {loading ? 'Genererer...' : 'Generer treningsprogram'}
              </button>
            </form>
          </div>
        </div>

        {/* Results Section */}
        {program && (
          <div className="mt-6 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-lg shadow-lg border border-zinc-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-400">Ditt Treningsprogram</h2>
              <button
                onClick={handleGeneratePDFWithJS}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded"
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
            <h2 className="text-xl font-bold mb-4 text-blue-400">Viktige detaljer før treningsprogram generering</h2>
            <p className="mb-4 text-gray-400">For å lage et optimalt treningsprogram, trenger vi noen viktige detaljer:</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Hva er ditt mål med treningen?</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="mal"
                      value="styrke"
                      checked={formData.mal.includes('styrke')}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span>Øke styrke</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="mal"
                      value="muskeloppbygging"
                      checked={formData.mal.includes('muskeloppbygging')}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span>Muskeloppbygging</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="mal"
                      value="utholdenhet"
                      checked={formData.mal.includes('utholdenhet')}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span>Bedre utholdenhet</span>
                  </label>
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
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Hvilket utstyr har du tilgang til?</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="utstyr"
                      value="ingen"
                      checked={formData.utstyr.includes('ingen')}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span>Ingen utstyr</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="utstyr"
                      value="hjemme"
                      checked={formData.utstyr.includes('hjemme')}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span>Hjemmetreningsutstyr</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="utstyr"
                      value="studio"
                      checked={formData.utstyr.includes('studio')}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span>Treningsstudio</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Split type</label>
                <select
                  name="splitType"
                  value={formData.splitType}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="full kropp">Full kropp</option>
                  <option value="2-split">2-split (Øvre/Undre kropp)</option>
                  <option value="3-split">3-split (Push/Pull/Legs)</option>
                  <option value="4-split">4-split</option>
                  <option value="5-split">5-split</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Antall treningsdager per uke</label>
                <select
                  name="dager"
                  value={formData.dager}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="2">2 dager</option>
                  <option value="3">3 dager</option>
                  <option value="4">4 dager</option>
                  <option value="5">5 dager</option>
                  <option value="6">6 dager</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Treningsøkt varighet</label>
                <select
                  name="oktTid"
                  value={formData.oktTid}
                  onChange={handleChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="20-30 min">20-30 minutter</option>
                  <option value="30-45 min">30-45 minutter</option>
                  <option value="45-60 min">45-60 minutter</option>
                  <option value="60+ min">60+ minutter</option>
                </select>
              </div>
              
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="inkluderMaksvekt"
                    checked={formData.inkluderMaksvekt}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium">Inkluder maksvekt i øvelser</span>
                </label>
              </div>
              
              {formData.inkluderMaksvekt && (
                <div className="space-y-2 pl-4 border-l-2 border-zinc-700">
                  <div>
                    <label className="block text-sm mb-1">Benkpress (kg)</label>
                    <input
                      type="number"
                      name="maksvekt.benkpress"
                      value={formData.maksvekt.benkpress}
                      onChange={handleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Knebøy (kg)</label>
                    <input
                      type="number"
                      name="maksvekt.kneboy"
                      value={formData.maksvekt.kneboy}
                      onChange={handleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Markløft (kg)</label>
                    <input
                      type="number"
                      name="maksvekt.markloft"
                      value={formData.maksvekt.markloft}
                      onChange={handleChange}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
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
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded"
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
