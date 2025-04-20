import React, { useState } from "react";
import Link from "next/link";

export default function Drommetolkning() {
  const [dreamInput, setDreamInput] = useState('');
  const [interpretation, setInterpretation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dreamInput.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Du er en erfaren drømmetyder og psykolog. Analyser følgende drøm og gi en detaljert tolkning:

DRØMMEN:
${dreamInput}

Gi en tolkning som inkluderer:
1. Symboltolkning
2. Psykologisk tolkning
3. Drømmepsykologi
4. Praktiske innsikter og anbefalinger

Formater svaret i HTML med <section>, <h2>, <p> tags.`
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'En feil oppstod ved tolkning av drømmen');
      }

      setInterpretation(data.result);
    } catch (err) {
      console.error('Feil ved drømmetydning:', err);
      setError(err.message || 'En feil oppstod ved tolkning av drømmen');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-800 to-purple-950 text-white p-4 sm:p-8 pt-16 sm:pt-20">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        <div className="bg-purple-700 p-4 sm:p-6 rounded-xl shadow-xl">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">
            Drømmetolkning
          </h1>
          
          <p className="text-base sm:text-lg mb-4 sm:mb-6 text-center text-purple-200">
            Få innsikt i drømmene dine gjennom profesjonell symboltolkning og AI-veiledet forståelse.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={dreamInput}
              onChange={(e) => setDreamInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Fortell om drømmen din og få hjelp til å tolke den..."
              className="w-full h-32 sm:h-40 p-3 sm:p-4 rounded-lg bg-purple-900/50 border border-purple-600 focus:border-purple-400 focus:ring-2 focus:ring-purple-400 focus:outline-none text-purple-100 placeholder-purple-500 text-sm sm:text-base"
            />
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                loading
                  ? 'bg-purple-700/50 text-purple-400/50 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}
            >
              {loading ? 'Tolker drømmen...' : 'Tolk drømmen'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 sm:p-4 bg-red-500/20 border border-red-500 rounded-lg">
              <p className="text-red-200 text-sm sm:text-base">{error}</p>
            </div>
          )}
        </div>

        {interpretation && (
          <div className="bg-purple-700 p-4 sm:p-6 rounded-xl shadow-xl">
            <div className="prose prose-sm sm:prose prose-invert prose-p:text-purple-100 prose-headings:text-purple-200 prose-strong:text-purple-200 prose-li:text-purple-100 max-w-none" dangerouslySetInnerHTML={{ __html: interpretation }} />
          </div>
        )}

        {!interpretation && !loading && (
          <div className="bg-purple-700 p-4 sm:p-6 rounded-xl shadow-xl">
            <h2 className="text-xl sm:text-2xl font-semibold flex items-center mb-2">
              <span className="mr-2">🧠</span> Eksempel på drømmetydning
            </h2>
            <p className="mb-3 sm:mb-4 text-sm sm:text-base">
              Her vil din drøm bli tolket med fokus på symbolikk, psykologiske aspekter og praktiske innsikter.
            </p>
            <p className="text-sm text-purple-200">
              Tips: Jo mer detaljert du beskriver drømmen, desto mer nøyaktig blir tolkningen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
