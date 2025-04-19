import { useState, useRef, useEffect } from 'react';
import { generatePDF } from '../utils/pdfGenerator';

export default function ProgramGenerator() {
  const [formData, setFormData] = useState({
    navn: '',
    alder: '',
    kjonn: '',
    hoyde: '',
    vekt: '',
    treningsniva: '',
    splitType: '3-split',
    mal: [],
    helse: '',
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
  const chatEndRef = useRef(null);

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
Navn: ${data.navn}, Alder: ${data.alder}, Kjønn: ${data.kjonn}, Høyde: ${data.hoyde}, Vekt: ${data.vekt}
Mål: ${data.mal.join(', ')}, Helse: ${data.helse}, Utstyr: ${data.utstyr.join(', ')}, Tid: ${data.oktTid}
${maksvektTxt}
Svar i HTML med kun <h1>-<h3>, <ul>, <li>, <p>. Ikke bruk <html>, <head> eller <body>.`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProgram('');
    setChatHistory([]);

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

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    const currentQuestion = chatInput;
    setChatInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Du er en AI-trener. Bruk HTML (<p>,<h2>,<ul>) og svar på:\n"${currentQuestion}"`
        }),
      });

      const data = await response.json();
      setChatHistory((prev) => [...prev, { question: currentQuestion, answer: data.result || 'Ingen svar' }]);
    } catch (error) {
      setChatHistory((prev) => [...prev, { question: currentQuestion, answer: 'Feil under henting av svar.' }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  const handleGeneratePDF = async () => {
    const doc = generatePDF(program, 'Personlig Treningsprogram', formData);
    doc.save('treningsprogram.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-2xl w-full mx-auto bg-white/10 p-6 rounded-2xl shadow-xl flex flex-col flex-grow">
        <h1 className="text-2xl font-bold mb-4 text-center pt-24">Få ditt personlige treningsprogram</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="navn" placeholder="Navn" onChange={handleChange} className="input-field" />
          <input name="alder" placeholder="Alder" onChange={handleChange} className="input-field" />
          <select name="kjonn" onChange={handleChange} className="input-field">
            <option value="">Velg kjønn</option>
            <option value="Mann">Mann</option>
            <option value="Kvinne">Kvinne</option>
          </select>
          <input name="hoyde" placeholder="Høyde (cm)" onChange={handleChange} className="input-field" />
          <input name="vekt" placeholder="Vekt (kg)" onChange={handleChange} className="input-field" />

          <select name="treningsniva" onChange={handleChange} className="input-field">
            <option value="">Treningsnivå</option>
            <option value="Nybegynner">Nybegynner</option>
            <option value="Viderekommen">Viderekommen</option>
            <option value="Avansert">Avansert</option>
          </select>

          <select name="splitType" onChange={handleChange} className="input-field">
            <option value="3-split">3-split</option>
            <option value="4-split">4-split</option>
            <option value="Fullkropp">Fullkropp</option>
          </select>

          <textarea name="helse" placeholder="Helseutfordringer?" onChange={handleChange} className="input-field" />

          <button type="submit" className="btn-primary w-full">
            {loading ? 'Genererer...' : 'Generer treningsprogram'}
          </button>
        </form>

        {program && (
          <>
            <div className="mt-6 card">
              <h2 className="text-lg font-semibold mb-2">Ditt program:</h2>
              <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: program }} />
            </div>

            <button
              onClick={handleGeneratePDF}
              className="btn-secondary w-full mt-4"
            >
              Last ned PDF
            </button>

            <div className="mt-10 flex flex-col space-y-4">
              <h3 className="text-lg font-bold">Chat med AI-trener</h3>
              <div className="card h-64 overflow-y-auto space-y-4">
                {chatHistory.map((entry, idx) => (
                  <div key={idx}>
                    <p className="text-orange-300 font-semibold">🟠 Du:</p>
                    <p>{entry.question}</p>
                    <p className="text-green-300 font-semibold">🟢 AI-trener:</p>
                    <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: entry.answer }} />
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="input-field"
                placeholder="Skriv et spørsmål og trykk Enter (Shift+Enter for linjeskift)"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
