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
    budsjett: 'moderat',
    treningsdager: '3',
    matpreferanser: [],
    kostrestriksjoner: []
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
    return `Du er en ernæringsekspert. Lag en detaljert kostholdsplan som følger denne strukturen:

1. BRUKERDATA
- Navn: [Bruker]
- Alder: ${data.alder}
- Kjønn: ${data.kjonn}
- Høyde: ${data.hoyde} cm
- Vekt: ${data.vekt} kg
- Aktivitetsnivå: ${data.aktivitetsniva}
- Mål: ${data.mal.join(', ')}
- Allergier/Preferanser: ${data.allergier.length > 0 ? data.allergier.join(', ') : 'Ingen'}

2. KOSTHOLDSPLAN BEREGNINGER
- Beregn TDEE (Totalt Daglig Energiforbruk) basert på brukerdata
- Beregn makronæringsfordeling basert på mål
- Spesifiser protein, karbohydrater og fett i gram og prosent
- Inkluder anbefalte supplementer hvis relevant

3. DAGLIG KOSTHOLDSPLAN
Lag en detaljert plan med nøyaktig ${data.maaltider} hovedmåltider og ${data.snacks} mellommåltider.
For hvert måltid, spesifiser:
- Måltidsnavn
- Ingredienser med mengder
- Næringsinnhold (kalorier, protein, karbohydrater, fett)
- Tilberedningstips tilpasset ${data.koking} kokekunnskap

4. UKENTLIG MIDDAGSPLAN
Lag en variert ukesplan for middager som passer med brukerens ${data.budsjett} budsjett.
For hver middag, spesifiser:
- Rett
- Ingredienser med mengder
- Næringsinnhold
- Tilberedning

5. HANDLELISTE
Organiser ingrediensene i kategorier:
- Kjøtt/Fisk/Egg
- Meieriprodukter
- Frukt og grønnsaker
- Kornprodukter
- Krydder og oljer
- Annet

6. OPPSUMMERING
- Totale daglige kalorier
- Makronæringsfordeling
- Estimert kostnad per uke
- Tips for måltidsprep
- Oppbevaringstips

Svar i HTML-format med <h1>-<h3> for overskrifter, <ul> og <li> for lister, og <p> for tekst.
Ikke inkluder <html>, <head> eller <body> tagger.
Bruk norsk språk og metriske måleenheter.`;
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
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800">
      <Head>
        <title>CoreMind Kosthold - Personlig Kostholdsplan</title>
      </Head>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 bg-gray-800 p-6 rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold text-center text-white mb-8">Personlig Kostholdsplan</h1>
          
          {/* Grunnleggende informasjon */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-blue-400">Personlig Informasjon</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300">Alder</label>
                <input
                  type="number"
                  name="alder"
                  value={formData.alder}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300">Kjønn</label>
                <select
                  name="kjonn"
                  value={formData.kjonn}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white rounded p-2"
                  required
                >
                  <option value="">Velg kjønn</option>
                  <option value="mann">Mann</option>
                  <option value="kvinne">Kvinne</option>
                  <option value="annet">Annet</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300">Høyde (cm)</label>
                <input
                  type="number"
                  name="hoyde"
                  value={formData.hoyde}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-300">Vekt (kg)</label>
                <input
                  type="number"
                  name="vekt"
                  value={formData.vekt}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white rounded p-2"
                  required
                />
              </div>
            </div>
          </div>

          {/* Aktivitetsnivå og mål */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-blue-400">Aktivitet og Mål</h2>
            <div>
              <label className="block text-gray-300">Aktivitetsnivå</label>
              <select
                name="aktivitetsniva"
                value={formData.aktivitetsniva}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white rounded p-2"
                required
              >
                <option value="">Velg aktivitetsnivå</option>
                <option value="stillesittende">Stillesittende (lite eller ingen trening)</option>
                <option value="lett_aktiv">Lett aktiv (1-3 økter i uken)</option>
                <option value="moderat_aktiv">Moderat aktiv (3-5 økter i uken)</option>
                <option value="veldig_aktiv">Veldig aktiv (6-7 økter i uken)</option>
                <option value="ekstremt_aktiv">Ekstremt aktiv (2+ økter per dag)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-300 mb-2">Mål (velg alle som passer)</label>
              <div className="space-y-2">
                {['Vektnedgang', 'Vedlikeholde vekt', 'Muskelvekst', 'Bedre helse', 'Mer energi', 'Bedre prestasjon'].map((goal) => (
                  <label key={goal} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="mal"
                      value={goal}
                      checked={formData.mal.includes(goal)}
                      onChange={handleChange}
                      className="form-checkbox text-blue-500"
                    />
                    <span className="text-gray-300">{goal}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Måltidsplanlegging */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-blue-400">Måltidsplanlegging</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300">Antall hovedmåltider per dag</label>
                <select
                  name="maaltider"
                  value={formData.maaltider}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white rounded p-2"
                >
                  {[2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-300">Antall mellommåltider</label>
                <select
                  name="snacks"
                  value={formData.snacks}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white rounded p-2"
                >
                  {[0, 1, 2, 3, 4].map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Matpreferanser og restriksjoner */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-blue-400">Matpreferanser og Restriksjoner</h2>
            <div>
              <label className="block text-gray-300 mb-2">Allergier/Intoleranser</label>
              <div className="space-y-2">
                {[
                  'Gluten', 'Laktose', 'Nøtter', 'Egg', 'Skalldyr', 'Soya', 
                  'Fisk', 'Melk', 'Hvete', 'Annet'
                ].map((allergi) => (
                  <label key={allergi} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="allergier"
                      value={allergi}
                      checked={formData.allergier.includes(allergi)}
                      onChange={handleChange}
                      className="form-checkbox text-blue-500"
                    />
                    <span className="text-gray-300">{allergi}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Praktiske hensyn */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-blue-400">Praktiske Hensyn</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300">Kokekunnskaper</label>
                <select
                  name="koking"
                  value={formData.koking}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white rounded p-2"
                >
                  <option value="nybegynner">Nybegynner</option>
                  <option value="enkel">Enkel matlaging</option>
                  <option value="middels">Middels erfaren</option>
                  <option value="erfaren">Erfaren</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300">Matbudsjett</label>
                <select
                  name="budsjett"
                  value={formData.budsjett}
                  onChange={handleChange}
                  className="w-full bg-gray-700 text-white rounded p-2"
                >
                  <option value="lav">Økonomisk</option>
                  <option value="moderat">Moderat</option>
                  <option value="hoy">Høyt</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            Generer Kostholdsplan
          </button>
        </form>

        {showDetailsPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md my-8">
              <h2 className="text-xl font-bold text-white mb-4">Bekreft valg</h2>
              <p className="text-gray-300 mb-4">
                Du har valgt {formData.maaltider} hovedmåltider og {formData.snacks} mellommåltider per dag.
                Kostholdsplanen vil bli tilpasset dine mål og preferanser.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGenerateProgram}
                  className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Generer Plan
                </button>
                <button
                  onClick={() => setShowDetailsPopup(false)}
                  className="w-full sm:flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Avbryt
                </button>
              </div>
            </div>
          </div>
        )}

        {program && (
          <div className="mt-6 bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-lg shadow-lg border border-zinc-700 overflow-y-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
              <h2 className="text-xl font-semibold text-green-400">Ditt Kosthold</h2>
              <button
                onClick={handleGeneratePDFWithJS}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 rounded"
              >
                Last ned PDF
              </button>
            </div>
            <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: program }} />
          </div>
        )}
      </main>
    </div>
  );
} 