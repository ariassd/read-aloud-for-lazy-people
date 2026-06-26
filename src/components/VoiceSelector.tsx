import React, { useState, useMemo } from 'react';

const VOICE_DATA = [
  { lang: "en-US", name: "en-US-AnaNeural", label: "Ana (US)" },
  { lang: "en-US", name: "en-US-ChristopherNeural", label: "Christopher (US)" },
  { lang: "es-ES", name: "es-ES-ElviraNeural", label: "Elvira (Spain)" },
  { lang: "es-MX", name: "es-MX-JorgeNeural", label: "Jorge (Mexico)" },
];

interface VoiceSelectorProps {
  onSelectVoice: (voiceCode: string) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ onSelectVoice }) => {
  const [selectedLang, setSelectedLang] = useState<string>(VOICE_DATA[0].lang);
  
  // Filter voices based on selected language
  const availableVoices = useMemo(() => 
    VOICE_DATA.filter(v => v.lang === selectedLang), 
    [selectedLang]
  );

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSelectVoice(e.target.value);
  };

  return (
    <div className="symbols">
      <label>Language: 
        <select value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)}>
          {[...new Set(VOICE_DATA.map(v => v.lang))].map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </label>

      <label>Voice: 
        <select onChange={handleVoiceChange}>
          <option value="">Select a voice...</option>
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