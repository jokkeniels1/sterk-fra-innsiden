import { useState, useRef, useEffect } from 'react';
import { generatePDF } from '../utils/pdfGenerator';
import { jsPDF } from 'jspdf';

export default function ProgramGenerator() {
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
    <div className="min-h-screen bg-gradient-to-b from-blue-800 to-blue-950 text-white p-4 sm:p-8 pt-16 sm:pt-20">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        <div className="bg-blue-700 p-4 sm:p-6 rounded-xl shadow-xl">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
            Treningsveiledning
          </h1>
          
          <div className="chat-container bg-blue-900/50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 max-h-[500px] overflow-y-auto">
            <div className="space-y-4">
              {chatHistory.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 sm:p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-800/60 ml-8 sm:ml-12'
                      : 'bg-blue-700/60 mr-8 sm:mr-12'
                  }`}
                >
                  <p className="text-sm sm:text-base text-blue-100">{message.content}</p>
                </div>
              ))}
              {isLoading && (
                <div className="bg-blue-700/60 p-3 sm:p-4 rounded-lg mr-8 sm:mr-12">
                  <p className="text-sm sm:text-base text-blue-200">Tenker...</p>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Still spørsmål om trening her... (Trykk Enter for å sende, Shift+Enter for linjeskift)"
              className="w-full h-24 sm:h-32 p-3 sm:p-4 rounded-lg bg-blue-900/50 border border-blue-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:outline-none text-blue-100 placeholder-blue-500 font-medium text-sm sm:text-base"
            />
            
            <button
              type="submit"
              disabled={isLoading || !chatInput.trim()}
              className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                isLoading || !chatInput.trim()
                  ? 'bg-blue-700/50 text-blue-400/50 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
