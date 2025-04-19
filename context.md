Ja! Her er en kontekst-oppsummering av appen som du kan bruke i Cursor (eller andre dev- eller AI-verktøy) for å gi et raskt, helhetlig overblikk:

---

### 🧠 **CoreMind App Context (for Cursor eller AI-assistanse)**

**Formål:**  
CoreMind er en helhetlig, profesjonell webapp for fysisk og mental styrketrening, kosthold og drømmetolkning – med støtte fra kunstig intelligens.

---

### 🧩 **Struktur / Sider:**

- `/` **Hjem:**  
  Intro med fire hovedmoduler (Fysisk trening, Mental styrke, Kosthold, Drømmetolkning). Designet i mørkt tema med ikon-bokser og tilhørende lenker.

- `/trening-kropp`:  
  Genererer personlig treningsprogram basert på brukerdata (alder, kjønn, vekt, utstyr, mål osv.) med støtte for maksvekt og AI-prompt. Kan generere PDF.

- `/trening-hode`:  
  Fokus på mental trening. AI-chat og øvelser for mestring, ro og motivasjon.

- `/kosthold`:  
  Brukerdata + mål (f.eks. bygge muskler) sendes til AI. Genererer ukesmeny og PDF. Automatisk handleliste inkludert.

- `/drommetolkning`:  
  Profesjonelt oppsett for visning av AI-generert tolkning av drømmer med tekst og ikoner. Kan bygges ut videre for input-basert AI-tolkning.

- `/chat`:  
  Dedikert AI-chat med GPT via OpenRouter API. Brukes som interaktiv trenings- eller kostholdspartner.

---

### ⚙️ **Funksjonalitet:**

- GPT via `openrouter.ai`  
  Bruker `OPENROUTER_API_KEY` via `.env.local`

- **Prompt-motor:**  
  Egendefinerte og detaljerte prompts for hver modul. AI skal fremstå som en erfaren trener, coach og tolk.

- **PDF-generering:**  
  Bruker `jsPDF` for å generere trenings- og kostholdsplaner lokalt.

- **Dynamisk skjemahåndtering:**  
  Trenings- og kostholdsmodul har smart state-håndtering, validering og kondisjonell rendering (maksvekt, utstyr, mål, osv.)

---

### 🎨 **Design / UI:**

- Mørkt tema med Tailwind CSS
- Runde, luftige bokser
- Ikonbasert seksjonsnavigasjon
- Fokus på klarhet og profesjonelt uttrykk
- Vekt på brukeropplevelse og motivasjon

---

### 🧪 **Neste steg / forbedringer:**

- Legge til treningsbilder automatisk generert av AI (valgfritt)  
- Mulighet for brukerinnlogging / lagring  
- Bedre struktur for PDF-format (f.eks. tabeller / layout)  
- Ny input-basert drømmetolkning via AI

---