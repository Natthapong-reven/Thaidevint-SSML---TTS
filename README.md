<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1pG7EB7VGaGfNHiJUD-RXy15xGmZXa-BZ

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
## ⚙️ Core Features & Functionality

### 1. Input Section

- **Input Text Area:**  
  - Main field for Devanagari text input.  
  - Supports multi-line entries.  
  - Includes a default example for quick testing.  

- **Pronunciation Guide:**  
  - Editable field for phonetic guidance (IPA or descriptive).  
  - Helps AI generate accurate SSML for nuanced words.

- **Control Buttons:**  
  - 🌀 **Reset** — Restores the default text.  
  - 🧹 **Clear** — Clears the input.  
  - 👁️ **Show/Hide Guide** — Toggles Pronunciation Guide visibility.  

- **Language Detection:**  
  - Automatically identifies the primary language (e.g., Sanskrit, Hindi).  
  - Displays the detected language in the interface.

---

### 2. AI-Powered Research

- **AI Fast Research Button:**  
  Sends the input text to **Gemini API** for in-depth analysis.  
  Returns a detailed **Research Report** containing:
  - 🎙️ **Recommended Settings** — Ideal voice, tone, and expression.  
  - 👩‍💼 **Ideal Speaker Profile** — Describes gender, age, and personality.  
  - 🧠 **AI Reasoning** — Explains the logic behind each recommendation.  
  - 🔤 **Suggested Pronunciation Guide** — IPA-based phonetic guidance.  

- **Apply Suggestions Button:**  
  Instantly applies all AI recommendations to the user interface.

---

### 3. Output Section

#### SSML Generation
- **Generate SSML Button:**  
  Converts input + settings into a syntactically valid SSML script via Gemini API.  
- **SSML Code Block:**  
  Displays the result with syntax highlighting and a **Copy** button.

#### Audio Configuration & Generation
- **Vocal Expression:**  
  Choose delivery styles: *Speech*, *Chant*, *Recitation*.  
- **Tone / Prosody:**  
  Select tone styles like *Calm*, *Energetic*, *Reverent*, etc.  
- **Voice Selection:**  
  Interactive list with previews for male/female voices.  
  Includes description, sample play, and balance ordering.

#### Audio Controls
- ▶️ **Play Audio:**  
  - Validates SSML syntax before synthesis.  
  - Plays the audio directly in the browser.  
- 💾 **Save SSML:**  
  - Downloads the generated SSML as `.ssml`.  
- 🔊 **Export Audio:**  
  - Downloads the synthesized `.wav` file.

---

### 4. Quality Control & User Experience

- **Settings Sync:**  
  Auto-clears outdated SSML/audio when user changes key settings.  
- **State Management:**  
  Displays clear loading indicators for async processes.  
- **Error Handling:**  
  Shows user-friendly alerts for API or syntax errors.  
- **CORS & Authentication:**  
  Reinstantiates API client per request to prevent key mismatch errors.

---

## 🚀 User Workflow

1. ✍️ Enter or paste **text** into the input area.  
2. ⚡ *(Optional)* Click **AI Fast Research** for smart recommendations.  
3. 🧩 Review report → click **Apply Suggestions** to auto-configure settings.  
4. 🎚️ Fine-tune **Vocal Expression**, **Tone**, or **Voice** manually if desired.  
5. 🧠 Click **Generate SSML** → view SSML script.  
6. ▶️ Click **Play Audio** to preview speech.  
7. 💾 Save or export results:
   - `Save SSML` → `.ssml` file  
   - `Export Audio` → `.wav` file  

---

## 🧩 Technology Stack

- **Frontend:** React (with Tailwind UI)  
- **Backend:** Node.js / Express  
- **AI Engine:** Google Gemini API  
- **Speech Engine:** Google Cloud Text-to-Speech  
- **Language Support:** Sanskrit, Hindi, Marathi, Nepali  

---
