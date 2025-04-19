import React from "react";
import Link from "next/link";

export default function Drommetolkning() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-800 to-purple-950 text-white p-8 pt-20">
      <div className="max-w-3xl mx-auto bg-purple-700 p-6 rounded-xl shadow-xl">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Tolkning av drøm: Fallet fra fjellet
        </h1>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold flex items-center mb-2">
            <span className="mr-2">🧠</span> Symboltolkning
          </h2>
          <p>
            I drømmesymbolikk kan fjellet ofte representere utfordringer, høyder og mål. Å falle ned fra et fjell kan tolkes som en følelse av tap av kontroll, frykt for fiasko eller en bekymring for å ikke klare å oppfylle forventninger.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold flex items-center mb-2">
            <span className="mr-2">🧠</span> Psykologisk tolkning
          </h2>
          <p>
            Drømmen kan også reflektere indre konflikter, usikkerhet eller frykt for å mislykkes. Å falle ned kan symbolisere følelsen av å miste fotfestet i en situasjon eller følelsen av å være overveldet.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold flex items-center mb-2">
            <span className="mr-2">🧠</span> Drømmepsykologi
          </h2>
          <p>
            Ifølge drømmepsykologi kan fallet fra fjellet signalisere behovet for å takle problemer eller utfordringer på en annen måte. Det kan også representere behovet for å slippe kontroll og la ting skje naturlig.
          </p>
        </section>

        <p className="text-sm text-purple-200 mt-8">
          Det er viktig å huske at drømmer er en symbolsk manifestasjon av indre tanker og følelser. Å falle ned fra et fjell i en drøm kan være en påminnelse om viktigheten av å takle utfordringer med styrke, å akseptere sårbarhet og å søke støtte når det trengs.
        </p>
      </div>
    </div>
  );
}
