import Link from "next/link";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#f6f9f8] text-gray-800 font-sans">
      {/* Toppmeny */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-indigo-800 hover:opacity-80">
          🌱 Sterk Fra Innsiden
        </Link>
        <div className="flex gap-4 text-sm sm:text-base font-medium">
          <Link href="/" className="hover:underline">Hjem</Link>
          <Link href="/trening-kropp" className="hover:underline">Kropp</Link>
          <Link href="/trening-hode" className="hover:underline">Hode</Link>
          <Link href="/chat" className="hover:underline">AI-Buddy</Link>
          <Link href="/om" className="hover:underline">Om</Link>
        </div>
      </nav>

      {/* Sideinnhold */}
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <Component {...pageProps} />
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-inner py-6 text-center text-sm text-gray-500">
        <p>© 2025 Sterk Fra Innsiden – Laget med varme, styrke og balanse.</p>
        <p>Kontakt: <a href="mailto:kontakt@sterkfra.no" className="underline">kontakt@sterkfra.no</a></p>
      </footer>
    </div>
  );
}
