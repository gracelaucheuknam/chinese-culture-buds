/** Hash routing helpers. Routes follow SPEC §10. */

export type Route =
  | { name: 'start' }
  | { name: 'avatar' }
  | { name: 'map' }
  | { name: 'stickers' }
  | { name: 'parents' }
  | { name: 'dev' }
  | { name: 'theme'; themeId: string }
  | { name: 'activity'; themeId: string; activityId: string };

const KNOWN_SCREENS = new Set(['start', 'avatar', 'map', 'stickers', 'parents', 'dev']);

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, '').trim();
  if (!raw || raw === 'start') return { name: 'start' };

  if (KNOWN_SCREENS.has(raw)) {
    return { name: raw as 'avatar' | 'map' | 'stickers' | 'parents' | 'dev' };
  }

  const dash = raw.indexOf('-');
  if (dash > 0) {
    return {
      name: 'activity',
      themeId: raw.slice(0, dash),
      activityId: raw.slice(dash + 1),
    };
  }

  return { name: 'theme', themeId: raw };
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'start':
      return '#start';
    case 'avatar':
      return '#avatar';
    case 'map':
      return '#map';
    case 'stickers':
      return '#stickers';
    case 'parents':
      return '#parents';
    case 'dev':
      return '#dev';
    case 'theme':
      return `#${route.themeId}`;
    case 'activity':
      return `#${route.themeId}-${route.activityId}`;
  }
}

export function navigate(route: Route): void {
  const next = routeToHash(route);
  if (window.location.hash === next) {
    // Force listeners when re-navigating to the same hash
    window.dispatchEvent(new Event('hashchange'));
    return;
  }
  window.location.hash = next;
}
