import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Scene0 from "./components/Scene0";
import Scene1 from "./components/Scene1";
import Scene2 from "./components/Scene2";
import MainScene from "./components/MainScene";
import { useAudio } from "./hooks/useAudio";
import { AUDIO_CONFIG } from "./config/audio";

function App() {
  const [scene, setScene] = useState<0 | 1 | 2 | 3>(0);

  // Ambient background noise
  const { play: playAmbient, fadeOut: fadeOutAmbient } = useAudio({
    src: AUDIO_CONFIG.AMBIENT,
    loop: true,
    volume: 0.3
  });

  const handleScene0Complete = () => {
    setScene(1);
    playAmbient(); // Start ambient noise when transitioning to invitation scene
  };

  /* 
    Scene2 handles speech playback internally. 
    App.tsx manages the ambient fade out.
  */
  const handleStartExperience = () => {
    fadeOutAmbient(2000); // Fade out ambient noise as speech begins
    setScene(2);
  };

  const handleScene2Complete = () => {
    setScene(3);
  };
  const handleSkipIntro = () => {
    setScene(3); // Jump straight to MainScene
  };

  return (
    <div className="bg-black min-h-screen font-serif">
      <AnimatePresence mode="wait">
        {scene === 0 && (
          <Scene0 key="scene0" onComplete={handleScene0Complete} onSkip={handleSkipIntro} />
        )}

        {scene === 1 && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Scene1 onStart={handleStartExperience} />
          </motion.div>
        )}

        {scene === 2 && (
          <Scene2 key="scene2" onAudioEnd={handleScene2Complete} />
        )}

        {scene === 3 && (
          <MainScene key="main" />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
