import { useState, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
const Scene0 = lazy(() => import("./components/Scene0"));
const Scene1 = lazy(() => import("./components/Scene1"));
const Scene2 = lazy(() => import("./components/Scene2"));
const MainScene = lazy(() => import("./components/MainScene"));
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
          <Suspense fallback={null}>
            <Scene0 key="scene0" onComplete={handleScene0Complete} onSkip={handleSkipIntro} />
          </Suspense>
        )}

        {scene === 1 && (
          <motion.div
            key="scene1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Suspense fallback={null}>
              <Scene1 onStart={handleStartExperience} />
            </Suspense>
          </motion.div>
        )}

        {scene === 2 && (
          <Suspense fallback={null}>
            <Scene2 key="scene2" onAudioEnd={handleScene2Complete} />
          </Suspense>
        )}

        {scene === 3 && (
          <Suspense fallback={null}>
            <MainScene key="main" />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
