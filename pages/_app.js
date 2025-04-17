import Link from "next/link";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <div className="min-h-screen bg-[#f6f9f8] text-gray-800 font-sans">
      <nav className="bg-white shadow-md px-6 py-4 flex gap-6 text-sm sm:text-base font-medium">
        <Link href="/" className="hover:underline">Hjem</Link>
        <Link href="/trening-kropp" className="hover:underline">Trening for kroppen</Link>
        <Link href="/trening-hode" className="hover:underline">Trening for hodet</Link>
        <Link href="/chat" className="hover:underline">AI-treningsbuddy</Link>
        <Link href="/om" className="hover:underline">Om oss</Link>
      </nav>
      <main className="p-6 max-w-4xl mx-auto">
        <Component {...pageProps} />
      </main>
    </div>
  );
}