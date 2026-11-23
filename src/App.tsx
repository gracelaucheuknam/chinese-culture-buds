import { lazy, Suspense, useEffect, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingOverlay, LoadingScreen } from './components/LoadingScreen';
import { ScreenTransition } from './components/ScreenTransition';
import { ThemePreloadGate } from './components/ThemePreloadGate';
import { stopNarration } from './engine/audio';
import { ProgressProvider } from './engine/progress';
import { parseHash, routeToHash, type Route } from './engine/routing';

const StartScreen = lazy(() =>
  import('./screens/StartScreen').then((m) => ({ default: m.StartScreen })),
);
const AvatarCreator = lazy(() =>
  import('./screens/AvatarCreator').then((m) => ({ default: m.AvatarCreator })),
);
const MapScreen = lazy(() =>
  import('./screens/MapScreen').then((m) => ({ default: m.MapScreen })),
);
const ThemeHome = lazy(() =>
  import('./screens/ThemeHome').then((m) => ({ default: m.ThemeHome })),
);
const ActivityScreen = lazy(() =>
  import('./screens/ActivityScreen').then((m) => ({ default: m.ActivityScreen })),
);
const StickerBook = lazy(() =>
  import('./screens/StickerBook').then((m) => ({ default: m.StickerBook })),
);
const ParentsArea = lazy(() =>
  import('./screens/ParentsArea').then((m) => ({ default: m.ParentsArea })),
);
const DevScreen = lazy(() =>
  import('./screens/DevScreen').then((m) => ({ default: m.DevScreen })),
);

function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const sync = () => {
      // Clear previous screen audio/subtitle before the next screen's effects run
      stopNarration();
      setRoute(parseHash(window.location.hash));
    };
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);

    if (!window.location.hash) {
      window.location.hash = '#start';
    } else {
      // Ensure first paint matches current hash (e.g. deep link / refresh)
      setRoute(parseHash(window.location.hash));
    }

    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, []);

  return route;
}

function ScreenRouter({ route }: { route: Route }) {
  switch (route.name) {
    case 'start':
      return <StartScreen />;
    case 'avatar':
      return <AvatarCreator />;
    case 'map':
      return (
        <ThemePreloadGate themeId="map">
          <MapScreen />
        </ThemePreloadGate>
      );
    case 'stickers':
      return <StickerBook />;
    case 'parents':
      return <ParentsArea />;
    case 'dev':
      return <DevScreen />;
    case 'theme':
      return (
        <ThemePreloadGate themeId={route.themeId}>
          <ThemeHome themeId={route.themeId} />
        </ThemePreloadGate>
      );
    case 'activity':
      return (
        <ThemePreloadGate themeId={route.themeId}>
          <ActivityScreen themeId={route.themeId} activityId={route.activityId} />
        </ThemePreloadGate>
      );
    default: {
      const _exhaustive: never = route;
      return _exhaustive;
    }
  }
}

function RouteFallback() {
  return <LoadingOverlay label="載入畫面…" />;
}

function AppShell() {
  const route = useHashRoute();
  const [tipDismissed, setTipDismissed] = useState(false);
  const routeKey = routeToHash(route);

  return (
    <div className="app-shell">
      <ScreenTransition routeKey={routeKey}>
        <Suspense fallback={<RouteFallback />}>
          <ScreenRouter key={routeKey} route={route} />
        </Suspense>
      </ScreenTransition>

      <div
        className={`orientation-tip${tipDismissed ? ' dismissed' : ''}`}
        role="dialog"
        aria-label="請轉為橫向"
      >
        <p>請將平板轉為橫向，體驗會更好喔！</p>
        <button type="button" onClick={() => setTipDismissed(true)}>
          繼續使用
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ProgressProvider>
        <LoadingScreen />
        <AppShell />
      </ProgressProvider>
    </ErrorBoundary>
  );
}
