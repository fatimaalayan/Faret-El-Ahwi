import { useGameStore } from './engine/gameStore';
import { Layout } from './components/Layout/Layout';
import { SetupScreen } from './screens/SetupScreen';
import { ReadyScreen } from './screens/ReadyScreen';
import { GameScreen } from './screens/GameScreen';
import { ResultScreen } from './screens/ResultScreen';

export default function App() {
  const phase = useGameStore((state) => state.phase);

  const renderCurrentPhaseScreen = () => {
    switch (phase) {
      case 'SETUP':
        return <SetupScreen />;
      case 'READY':
        return <ReadyScreen />;
      case 'ROUND_ACTIVE':
        return <GameScreen />;
      case 'ROUND_END':
        return <ResultScreen />;
      default:
        return <SetupScreen />;
    }
  };

  return (
    <Layout>
      {renderCurrentPhaseScreen()}
    </Layout>
  );
}
