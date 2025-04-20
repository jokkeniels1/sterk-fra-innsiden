import { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';

export default function Kosthold() {
  const [formData, setFormData] = useState({
    alder: '',
    kjonn: 'mann',
    vekt: '',
    hoyde: '',
    aktivitetsniva: 'moderat',
    mål: 'vedlikehold',
    diett: 'ingen',
    allergier: '',
    preferanser: '',
  });
  const [mealPlan, setMealPlan] = useState(null);
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
          message: `Som en profesjonell ernæringsfysiolog, vennligst svar på følgende spørsmål om kosthold: ${question}`
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
      handleChatSubmit();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowDetailsPopup(true);
  };

  const handleGenerateMealPlan = async () => {
    setShowDetailsPopup(false);
    setLoading(true);
    setError(null);
    setShowChat(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generer en personlig kostholdsplan basert på følgende data:
          Alder: ${formData.alder}
          Kjønn: ${formData.kjonn}
          Vekt: ${formData.vekt} kg
          Høyde: ${formData.hoyde} cm
          Aktivitetsnivå: ${formData.aktivitetsniva}
          Mål: ${formData.mål}
          Diett: ${formData.diett}
          Allergier: ${formData.allergier || 'Ingen'}
          Matpreferanser: ${formData.preferanser || 'Ingen spesielle'}

          Inkluder:
          1. Beregnet daglig kaloriebehov (TDEE)
          2. Anbefalt proteininntak
          3. Fordeling av makronæringsstoffer
          4. Ukentlig middagsplan
          5. Handleliste
          6. Oppsummering av daglige gjennomsnitt
          
          Formater svaret i HTML med <h2>, <p>, <ul>, <li> tags.`
        }),
      });

      const data = await response.json();
      setMealPlan(data.result);
    } catch (err) {
      setError('Det oppstod en feil ved generering av kostholdsplan. Prøv igjen senere.');
      console.error('Feil ved generering av kostholdsplan:', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!mealPlan) return;

    const doc = new jsPDF();
    const content = mealPlan.replace(/<[^>]*>/g, '');

    doc.setFontSize(16);
    doc.text('Personlig Kostholdsplan', 20, 20);

    doc.setFontSize(12);
    doc.text(`Alder: ${formData.alder}`, 20, 30);
    doc.text(`Kjønn: ${formData.kjonn}`, 20, 40);
    doc.text(`Vekt: ${formData.vekt} kg`, 20, 50);
    doc.text(`Høyde: ${formData.hoyde} cm`, 20, 60);
    doc.text(`Aktivitetsnivå: ${formData.aktivitetsniva}`, 20, 70);
    doc.text(`Mål: ${formData.mål}`, 20, 80);
    doc.text(`Diett: ${formData.diett}`, 20, 90);
    doc.text(`Allergier: ${formData.allergier || 'Ingen'}`, 20, 100);
    doc.text(`Matpreferanser: ${formData.preferanser || 'Ingen spesielle'}`, 20, 110);

    doc.setFontSize(14);
    doc.text('Kostholdsplan:', 20, 130);

    const splitText = doc.splitTextToSize(content, 170);
    doc.setFontSize(10);
    doc.text(splitText, 20, 140);

    doc.save('kostholdsplan.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-800 to-green-950 text-white p-4 sm:p-8 pt-16 sm:pt-20">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        <div className="bg-green-700 p-4 sm:p-6 rounded-xl shadow-xl">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
            Kostholdsveiledning
          </h1>
          
          <div className="chat-container bg-green-900/50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 max-h-[500px] overflow-y-auto">
            <div className="space-y-4">
              {chatHistory.map((message, index) => (
                <div
                  key={index}
                  className={`p-3 sm:p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-green-800/60 ml-8 sm:ml-12'
                      : 'bg-green-700/60 mr-8 sm:mr-12'
                  }`}
                >
                  <p className="text-sm sm:text-base text-green-100">{message.content}</p>
                </div>
              ))}
              {isLoading && (
                <div className="bg-green-700/60 p-3 sm:p-4 rounded-lg mr-8 sm:mr-12">
                  <p className="text-sm sm:text-base text-green-200">Tenker...</p>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Still spørsmål om kosthold her... (Trykk Enter for å sende, Shift+Enter for linjeskift)"
              className="w-full h-24 sm:h-32 p-3 sm:p-4 rounded-lg bg-green-900/50 border border-green-600 focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:outline-none text-green-100 placeholder-green-500 font-medium text-sm sm:text-base"
            />
            
            <button
              type="submit"
              disabled={isLoading || !chatInput.trim()}
              className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                isLoading || !chatInput.trim()
                  ? 'bg-green-700/50 text-green-400/50 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-500 text-white'
              }`}
            >
              Send
            </button>
          </form>
        </div>

        {/* Form Section */}
        <div className="bg-green-700 p-4 sm:p-6 rounded-xl shadow-xl">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Din Profil</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Alder</label>
                <input
                  type="number"
                  name="alder"
                  value={formData.alder}
                  onChange={handleInputChange}
                  className="w-full p-2 sm:p-3 rounded-lg bg-green-900/50 border border-green-600 focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:outline-none text-green-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Kjønn</label>
                <select
                  name="kjonn"
                  value={formData.kjonn}
                  onChange={handleInputChange}
                  className="w-full p-2 sm:p-3 rounded-lg bg-green-900/50 border border-green-600 focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:outline-none text-green-100"
                  required
                >
                  <option value="mann">Mann</option>
                  <option value="kvinne">Kvinne</option>
                  <option value="annet">Annet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Høyde (cm)</label>
                <input
                  type="number"
                  name="hoyde"
                  value={formData.hoyde}
                  onChange={handleInputChange}
                  className="w-full p-2 sm:p-3 rounded-lg bg-green-900/50 border border-green-600 focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:outline-none text-green-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Vekt (kg)</label>
                <input
                  type="number"
                  name="vekt"
                  value={formData.vekt}
                  onChange={handleInputChange}
                  className="w-full p-2 sm:p-3 rounded-lg bg-green-900/50 border border-green-600 focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:outline-none text-green-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Aktivitetsnivå</label>
                <select
                  name="aktivitetsniva"
                  value={formData.aktivitetsniva}
                  onChange={handleInputChange}
                  className="w-full p-2 sm:p-3 rounded-lg bg-green-900/50 border border-green-600 focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:outline-none text-green-100"
                  required
                >
                  <option value="sedentær">Sedentær (lite eller ingen trening)</option>
                  <option value="lett">Lett aktiv (1-3 dager/uke)</option>
                  <option value="moderat">Moderat aktiv (3-5 dager/uke)</option>
                  <option value="aktiv">Aktiv (6-7 dager/uke)</option>
                  <option value="veldig aktiv">Veldig aktiv (2x daglig)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mål</label>
                <select
                  name="mål"
                  value={formData.mål}
                  onChange={handleInputChange}
                  className="w-full p-2 sm:p-3 rounded-lg bg-green-900/50 border border-green-600 focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:outline-none text-green-100"
                  required
                >
                  <option value="vedlikehold">Vedlikeholde vekt</option>
                  <option value="vektnedgang">Vektnedgang</option>
                  <option value="muskeloppbygging">Muskeloppbygging</option>
                  <option value="helse">Bedre helse</option>
                  <option value="energi">Mer energi</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Matpreferanser/Allergier</label>
              <textarea
                name="allergier"
                value={formData.allergier}
                onChange={handleInputChange}
                placeholder="F.eks: vegetarianer, glutenfri, laktoseintoleranse..."
                className="w-full h-24 sm:h-32 p-2 sm:p-3 rounded-lg bg-green-900/50 border border-green-600 focus:border-green-400 focus:ring-2 focus:ring-green-400 focus:outline-none text-green-100"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg bg-green-600 hover:bg-green-500 text-white font-semibold transition-all text-sm sm:text-base"
            >
              Generer kostholdsplan
            </button>
          </form>
        </div>

        {/* Results Section */}
        {mealPlan && (
          <div className="bg-green-700 p-4 sm:p-6 rounded-xl shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <h2 className="text-xl sm:text-2xl font-semibold">Din Kostholdsplan</h2>
              <button
                onClick={generatePDF}
                className="w-full sm:w-auto px-4 py-2 sm:py-3 bg-green-600 hover:bg-green-500 rounded-lg text-white font-semibold transition-all text-sm sm:text-base"
              >
                Last ned PDF
              </button>
            </div>
            <div className="prose prose-invert max-w-none text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: mealPlan }} />
          </div>
        )}

        {error && (
          <div className="bg-red-600/20 border border-red-500 p-4 rounded-lg text-red-200 text-sm sm:text-base">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}