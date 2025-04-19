import { useState } from 'react';
import { generatePDF } from '../utils/pdfGenerator';

export default function Kosthold() {
  const [userData, setUserData] = useState({
    navn: '',
    alder: '',
    kjonn: '',
    hoyde: '',
    vekt: '',
    aktivitetsniva: '',
    mal: '',
    allergier: ''
  });

  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState('');
  const [history, setHistory] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const generatePrompt = () => {
    return `Du er en erfaren ernæringsfysiolog og personlig trener. Lag en detaljert kostholdsplan for muskelbygging.

BRUKERDATA:
- Navn: ${userData.navn}
- Alder: ${userData.alder}
- Kjønn: ${userData.kjonn}
- Høyde: ${userData.hoyde} cm
- Vekt: ${userData.vekt} kg
- Aktivitetsnivå: ${userData.aktivitetsniva}
- Mål: ${userData.mal}
- Allergier/Preferanser: ${userData.allergier}

KRAV TIL KOSTHOLDSPLANEN:

1. KOSTHOLDSPLAN BEREGNINGER:
   - Estimert TDEE (Totalt Daglig Energiforbruk) i kcal
   - Anbefalt daglig proteininntak i gram
   - Anbefalt makronæringsfordeling (prosentvis fordeling av protein, karbohydrater og fett)

2. UKENTLIG KOSTHOLDSPLAN:
   For hver av de 5 daglige måltidene (frokost, formiddagsmat, lunsj, middag, kveldsmat):
   - Måltidsnavn og beskrivelse
   - Presise porsjonsstørrelser for hver ingrediens i gram
   - Detaljert næringsinnhold (kcal, protein, karbohydrater, fett)
   - Vanninntak anbefaling i liter per dag

3. MIDDAGSRETTER:
   For hver av de 7 middagsrettene:
   - Navn på rett
   - Komplett ingrediensliste med mengder
   - Steg-for-steg tilberedelsesinstruksjoner
   - Næringsinnhold per porsjon (kcal, protein, karbohydrater, fett)

4. HANDLELISTE:
   Organiser i følgende kategorier:
   - Kjøtt
   - Grønnsaker
   - Kornprodukter
   - Frukt
   - Nøtter/Frø
   - Meieriprodukter
   - Diverse
   Inkluder presise mengder i gram for hver ingrediens.

5. OPPSUMMERING:
   - Snitt kalorier per dag
   - Snitt protein per dag
   - Snitt karbohydrater per dag
   - Snitt fett per dag
   - Estimert vektøkning per uke
   - Konkrete supplementeringstips
   - Meal prep og oppbevaringstips

VIKTIG:
- Alle tall og beregninger må være presise og realistiske
- Inkluder alle nødvendige vitaminer og mineraler
- Ta hensyn til måltidstiming rundt trening
- Gi konkrete anbefalinger for supplementering
- Inkluder praktiske tips for meal prep og oppbevaring

Formater svaret i HTML med:
- <h2> for hovedseksjoner (Brukerdata, Kostholdsplan Beregninger, etc.)
- <h3> for underseksjoner (Frokost, Lunsj, etc.)
- <ul> og <li> for lister
- <p> for paragrafer
- <strong> for viktig informasjon
- <table> for næringsberegninger og handleliste

Ikke bruk <html>, <head>, eller <body> tags.`;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: generatePrompt() }),
      });
      const data = await res.json();
      setPlan(data.result || 'Ingen respons.');
    } catch (err) {
      setPlan('Feil ved generering av kostholdsplan.');
    }
    setLoading(false);
  };

  const handleChatSubmit = async () => {
    if (!chat.trim()) return;
    const q = chat;
    setChat('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Du er en AI kostholdsekspert. Svar profesjonelt i HTML (<p>, <ul>, <li>) på: ${q}`
        }),
      });
      const data = await res.json();
      setHistory((prev) => [...prev, { q, a: data.result || 'Ingen svar' }]);
    } catch (err) {
      setHistory((prev) => [...prev, { q, a: 'Feil under henting av svar.' }]);
    }
  };

  const handleGeneratePDF = () => {
    const doc = generatePDF(plan, 'Personlig Kostholdsplan', userData);
    doc.save('kostholdsplan.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-3xl mx-auto card space-y-4">
        <h1 className="text-2xl font-bold text-center">Din personlige kostholdsplan</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="navn" placeholder="Navn" onChange={handleChange} className="input-field" />
          <input name="alder" placeholder="Alder" onChange={handleChange} className="input-field" />
          <input name="kjonn" placeholder="Kjønn" onChange={handleChange} className="input-field" />
          <input name="hoyde" placeholder="Høyde (cm)" onChange={handleChange} className="input-field" />
          <input name="vekt" placeholder="Vekt (kg)" onChange={handleChange} className="input-field" />
          <select name="aktivitetsniva" onChange={handleChange} className="input-field">
            <option value="">Aktivitetsnivå</option>
            <option value="lite aktiv">Lite aktiv</option>
            <option value="moderat aktiv">Moderat aktiv</option>
            <option value="svært aktiv">Svært aktiv</option>
          </select>
          <input name="mal" placeholder="F.eks. bygge muskler, gå ned i vekt" onChange={handleChange} className="input-field" />
          <input name="allergier" placeholder="Allergier / preferanser" onChange={handleChange} className="input-field" />
        </div>

        <button onClick={handleSubmit} className="btn-primary w-full">
          {loading ? 'Genererer...' : 'Generer kostholdsplan'}
        </button>

        {plan && (
          <>
            <div className="card">
              <h2 className="text-lg font-semibold mb-2">Din kostholdsplan:</h2>
              <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: plan }} />
              <button onClick={handleGeneratePDF} className="btn-secondary w-full mt-4">
                Last ned PDF
              </button>
            </div>

            <div className="mt-6 space-y-2">
              <h3 className="text-lg font-bold">Chat med AI kostholdsekspert</h3>
              <div className="card h-64 overflow-y-auto space-y-3">
                {history.map((item, i) => (
                  <div key={i}>
                    <p className="text-orange-300 font-semibold">🟠 Du:</p>
                    <p>{item.q}</p>
                    <p className="text-green-300 font-semibold">🟢 AI:</p>
                    <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: item.a }} />
                  </div>
                ))}
              </div>
              <textarea
                value={chat}
                onChange={(e) => setChat(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleChatSubmit())}
                className="input-field"
                placeholder="Still et spørsmål til AI-kostholdseksperten"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}