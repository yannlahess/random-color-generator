import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const COLORS = {
    rouge: { 
      fr: 'rouge', 
      en: 'red', 
      es: 'rojo', 
      code: '#FF0000' 
    },
    mauve: { 
      fr: 'mauve', 
      en: 'purple', 
      es: 'morado', 
      code: '#8A4FFF' 
    },
    bleu: { 
      fr: 'bleu', 
      en: 'blue', 
      es: 'azul', 
      code: '#0000FF' 
    },
    vert: { 
      fr: 'vert', 
      en: 'green', 
      es: 'verde', 
      code: '#00FF00' 
    },
    noir: { 
      fr: 'noir', 
      en: 'black', 
      es: 'negro', 
      code: '#000000' 
    }
  };

  const LANGUAGES = {
    fr: { name: 'Français', code: 'fr-FR' },
    en: { name: 'English', code: 'en-US' },
    es: { name: 'Español', code: 'es-ES' }
  };

  const [currentColor, setCurrentColor] = useState('rouge');
  const [isRunning, setIsRunning] = useState(false);
  const [frequency, setFrequency] = useState(2);
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  
  const [activeColors, setActiveColors] = useState(
    Object.keys(COLORS).reduce((acc, color) => ({...acc, [color]: true}), {})
  );

  const speechSynthesisRef = useRef(
    typeof window !== 'undefined' ? window.speechSynthesis : null
  );

  const speakColor = (colorName) => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(
        COLORS[colorName][selectedLanguage]
      );
      utterance.lang = LANGUAGES[selectedLanguage].code;
      speechSynthesisRef.current.speak(utterance);
    }
  };

  const changeColor = () => {
    const availableColors = Object.keys(activeColors).filter(
      color => activeColors[color]
    );
    
    if (availableColors.length === 0) {
      setIsRunning(false);
      return;
    }

    const randomColor = availableColors[
      Math.floor(Math.random() * availableColors.length)
    ];
    
    setCurrentColor(randomColor);
    speakColor(randomColor);
  };

  useEffect(() => {
    let intervalId;
    
    if (isRunning) {
      changeColor();
      intervalId = setInterval(changeColor, frequency * 1000);
    }

    return () => {
      clearInterval(intervalId);
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, [isRunning, frequency, activeColors, selectedLanguage]);

  const toggleColor = (color) => {
    if (!isRunning) {
      setActiveColors(prev => ({
        ...prev,
        [color]: !prev[color]
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ backgroundColor: COLORS[currentColor].code }}>
      <div className="bg-white/40 backdrop-blur-lg p-8 rounded-xl w-full max-w-md space-y-6">
        <h1 className="text-4xl font-bold text-white text-center uppercase">
          {COLORS[currentColor][selectedLanguage]}
        </h1>

        <div className="grid grid-cols-3 gap-2">
          {Object.entries(LANGUAGES).map(([code, lang]) => (
            <button
              key={code}
              onClick={() => setSelectedLanguage(code)}
              className={`p-2 rounded transition-colors ${
                selectedLanguage === code 
                  ? 'bg-white text-black' 
                  : 'bg-white/20 text-white'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <h2 className="text-white font-bold">Couleurs actives :</h2>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(COLORS).map(color => (
              <button
                key={color}
                onClick={() => toggleColor(color)}
                disabled={isRunning}
                className={`p-2 rounded flex items-center ${
                  activeColors[color]
                    ? 'bg-white text-black'
                    : 'bg-white/20 text-white'
                }`}
                style={{
                  borderLeft: `4px solid ${COLORS[color].code}`
                }}
              >
                {COLORS[color][selectedLanguage]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-white block">
            Fréquence : {frequency}s
          </label>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={frequency}
            onChange={(e) => !isRunning && setFrequency(Number(e.target.value))}
            disabled={isRunning}
            className="w-full"
          />
        </div>

        <button
          onClick={() => setIsRunning(!isRunning)}
          disabled={Object.values(activeColors).every(v => !v)}
          className={`w-full py-3 rounded-lg font-bold ${
            Object.values(activeColors).every(v => !v)
              ? 'bg-gray-400 text-gray-700'
              : 'bg-white text-black hover:bg-gray-100'
          }`}
        >
          {isRunning ? 'Arrêter' : 'Démarrer'}
        </button>
      </div>
    </div>
  );
};

export default App;