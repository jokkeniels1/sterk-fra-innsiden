
export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#f6f9f8] text-gray-800">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4">Sterk Fra Innsiden</h1>
        <p className="text-lg mb-6">
          Et trygt sted for deg som vil bruke bevegelse og små steg for å få det bedre – mentalt og fysisk.
        </p>

        <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-2">Hvordan har du det i dag?</h2>
          <p className="mb-4 text-sm text-gray-600">Velg det som passer best, så får du et forslag til et mildt og godt treningsopplegg.</p>
          <form className="flex flex-col gap-4">
            <button className="bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded-xl">Litt nedfor og sliten</button>
            <button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-xl">Urolig og stressa</button>
            <button className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-xl">Ok, men trenger struktur</button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-xl">Vil bare bevege meg litt</button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">Snakk med din AI-treningsbuddy</h2>
          <p className="mb-4 text-sm text-gray-600">
            Trenger du støtte, forslag til øvelser, eller bare noen vennlige ord? Vår AI-coach er her for deg.
          </p>
          <button className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-4 py-2 rounded-xl">
            Start samtale
          </button>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>© 2025 Sterk Fra Innsiden – Laget med varme og omtanke.</p>
        </div>
      </div>
    </main>
  );
}