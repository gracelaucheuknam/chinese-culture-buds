import { navigate, type Route } from '../engine/routing';

type Props = {
  title: string;
  description: string;
  links?: Array<{ label: string; route: Route }>;
};

export function PlaceholderScreen({ title, description, links = [] }: Props) {
  return (
    <section className="screen" aria-label={title}>
      <h1>{title}</h1>
      <p>{description}</p>
      <span className="placeholder-badge">Phase 0 佔位畫面</span>
      {links.length > 0 && (
        <nav className="nav-grid" aria-label="導覽">
          {links.map((link) => (
            <button
              key={link.label}
              type="button"
              className="nav-chip"
              onClick={() => navigate(link.route)}
            >
              {link.label}
            </button>
          ))}
        </nav>
      )}
    </section>
  );
}
