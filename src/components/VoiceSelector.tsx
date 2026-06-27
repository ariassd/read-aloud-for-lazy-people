import React, { useState, useEffect, useMemo } from "react";

export interface VoiceSelectionData {
  lang: string;
  voice: string;
}

interface VoiceSelectorProps {
  onSelectVoice: (data: VoiceSelectionData) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  onSelectVoice,
}) => {
  const [selectedLang, setSelectedLang] = useState<string>("auto");
  const [selectedVoice, setSelectedVoice] = useState<string>("auto");
  const [allVoices, setAllVoices] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/voices-data")
      .then((res) => res.json())
      .then((data) => {
        setAllVoices(data);
      })
      .catch((err) => console.error("Failed to load voices", err));
  }, []);

  const languages = useMemo(() => {
    const prefixes = allVoices.map((v) => v.lang.split("-")[0]);
    return [...new Set(prefixes)].sort();
  }, [allVoices]);

  const availableVoices = useMemo(
    () => allVoices.filter((v) => v.lang.startsWith(selectedLang)),
    [selectedLang, allVoices],
  );

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
      <label>
        Language:
        <select value={selectedLang} onChange={handleLanguageChange}>
          <option value="auto">Auto-detect</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </label>

      <label>
        Voice:
        <select value={selectedVoice} onChange={handleVoiceChange}>
          <option value="auto">Auto-select</option>
          {availableVoices.map((voice) => (
            <option key={voice.name} value={voice.name}>
              {voice.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};
