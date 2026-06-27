import React, { useEffect, useState } from "react";

//components
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { VoiceSelector, type VoiceSelectionData } from "./components/VoiceSelector";
import "./App.css";

function App() {
  const [dark, setDark] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("  ");
  const [voice, setVoice] = useState({ lang: "auto", voice: "auto" });
  const [text, setText] = useState("");

  useEffect(() => {
    setTimeout(() => setError(""), 2000);
  }, [error]);

  useEffect(() => {
    setDark(true);
    document.body.classList.toggle("light", true);
  }, []);

  const toggleTheme = () => {
    setDark(!dark);
    document.body.classList.toggle("light", !dark);
  };

  const changeVoice = (voice: VoiceSelectionData) => {
    setVoice(voice);
  };

  const getVoiceMessage = () => {
    if (!voice) {
      setError("Select a voice first");
      return;
    }
    if (!text) {
      setError("Write a text first");
      return;
    }

    setLoading(true);

    const fetchData = async () => {
      try {
        const [audioRes] = await Promise.all([
          fetch("/api/audio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lang: voice.lang , voice: voice.voice, text: text }),
          }),
        ]);

        if (!audioRes.ok) {
          const message = (await audioRes?.json())?.error;
          throw new Error(message || "Failed to fetch data");
        }

        setLoading(false);

        const audioBlob = await audioRes.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  };

  return (
    <React.Fragment>
      <Header dark={dark} onToggle={() => toggleTheme()} />
      <VoiceSelector onSelectVoice={changeVoice} />
      <div className="input-area">
        <div className="input-wrap">
          <textarea
            placeholder="Hello I am a reading tool designed to help you"
            autoComplete="off"
            value={text}
            className="main-textarea" // Add this class
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div>
          <button disabled={loading} onClick={getVoiceMessage}>
            Read this
          </button>
          {loading && (
            <div className="result">
              <span className="spinner"></span> Evaluating...
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="result">
          <div className="error">Error: {error}</div>
        </div>
      )}

      <Footer />
    </React.Fragment>
  );
}

export default App;
