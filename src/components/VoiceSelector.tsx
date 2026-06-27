import React, { useState, useMemo } from 'react';

export interface VoiceSelectionData {
  lang: string;
  voice: string;
}

const VOICE_DATA = [
  { lang: "en-US", name: "en-US-AnaNeural", label: "Ana (US)" },
  { lang: "en-US", name: "en-US-ChristopherNeural", label: "Christopher (US)" },
  { lang: "es-ES", name: "es-ES-ElviraNeural", label: "Elvira (Spain)" },
  { lang: "es-MX", name: "es-MX-JorgeNeural", label: "Jorge (Mexico)" },
];

interface VoiceSelectorProps {
  onSelectVoice: (data: VoiceSelectionData) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ onSelectVoice }) => {
  const [selectedLang, setSelectedLang] = useState<string>("auto");
  const [selectedVoice, setSelectedVoice] = useState<string>("auto");

  const availableVoices = useMemo(() => {
    if (selectedLang === "auto") return [];
    return VOICE_DATA.filter(v => v.lang === selectedLang);
  }, [selectedLang]);

  const notifyParent = (lang: string, voice: string) => {
    onSelectVoice({ lang, voice });
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    setSelectedLang(lang);
    setSelectedVoice("auto");
    notifyParent(lang, "auto");
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const voice = e.target.value;
    setSelectedVoice(voice);
    notifyParent(selectedLang, voice);
  };

  return (
    <div className="symbols">
      <label>Language: 
        <select value={selectedLang} onChange={handleLanguageChange}>
          <option value="auto">Auto-detect</option>
          {[...new Set(VOICE_DATA.map(v => v.lang))].map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </label>

      <label>Voice: 
        <select value={selectedVoice} onChange={handleVoiceChange}>
          <option value="auto">
            {selectedLang === "auto" ? "System Auto-select" : "Auto-select for this language"}
          </option>
          {availableVoices.map(voice => (
            <option key={voice.name} value={voice.name}>
              {voice.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};