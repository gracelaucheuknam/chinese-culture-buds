import { getTheme } from '../content/themes';
import { BigButton } from '../components/BigButton';
import { Subtitle } from '../components/Subtitle';
import { TopBar } from '../components/TopBar';
import { playSfx } from '../engine/audio';
import { useProgress } from '../engine/progress';
import { navigate } from '../engine/routing';

type Props = {
  themeId: string;
  activityId: string;
};

/** Temporary activity shell until Phase 3–5 games land. */
export function ActivityPlaceholder({ themeId, activityId }: Props) {
  const theme = getTheme(themeId);
  const { dispatch } = useProgress();
  const activity = theme?.activities.find((a) => a.id === activityId);
  const title = activity?.title.yue ?? activityId;

  return (
    <section className="screen" aria-label={title}>
      <TopBar backTo="theme" themeId={themeId} />
      <Subtitle />
      <h1>{title}</h1>
      <p>活動佔位（Phase 3–5 會接上真實遊戲）。可暫時標記完成以便測試貼紙流程。</p>
      <div className="nav-grid">
        <BigButton
          onClick={() => {
            dispatch({ type: 'COMPLETE_ACTIVITY', activityId });
            playSfx('success');
            navigate({ name: 'theme', themeId });
          }}
        >
          標記完成 ✔
        </BigButton>
        <BigButton variant="secondary" onClick={() => navigate({ name: 'theme', themeId })}>
          返回主題
        </BigButton>
      </div>
    </section>
  );
}
