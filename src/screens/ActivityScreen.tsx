import type React from 'react';
import { isActivityLocked } from '../config/access';
import { appConfig } from '../config/app';
import { getStory } from '../content/stories';
import { getTheme } from '../content/themes';
import { LanternGame } from '../activities/LanternGame';
import { ChoiceGame, type ChoiceConfig } from '../activities/ChoiceGame';
import { PuzzleGame, type PuzzleConfig } from '../activities/PuzzleGame';
import { RaceGame } from '../activities/RaceGame';
import { StoryPlayer } from '../activities/StoryPlayer';
import { ZongziGame } from '../activities/ZongziGame';
import { BigButton } from '../components/BigButton';
import { SceneBackground } from '../components/SceneBackground';
import { playSfx } from '../engine/audio';
import { useProgress } from '../engine/progress';
import { navigate } from '../engine/routing';
import { ActivityPlaceholder } from './ActivityPlaceholder';

type Props = {
  themeId: string;
  activityId: string;
};

export function ActivityScreen({ themeId, activityId }: Props) {
  const theme = getTheme(themeId);
  const activityIndex = theme?.activities.findIndex((a) => a.id === activityId) ?? -1;
  const activity = activityIndex >= 0 ? theme?.activities[activityIndex] : undefined;
  const { state, dispatch } = useProgress();
  const lang = state.profile?.lang ?? appConfig.defaultLang;

  /** Games sit on the festival's own picture, washed out so the pieces stand out. */
  const onScene = (node: React.ReactNode) => (
    <div
      className="scene-host"
      style={{ position: 'relative', width: '100%', height: '100%', isolation: 'isolate' }}
    >
      <SceneBackground src={theme?.bg} wash={0.55} />
      {node}
    </div>
  );

  const completeAndReturn = () => {
    dispatch({ type: 'COMPLETE_ACTIVITY', activityId });
    playSfx('cheer');
    navigate({ name: 'theme', themeId });
  };

  if (activityIndex >= 0 && isActivityLocked(activityIndex, state.surveyUnlocked)) {
    return (
      <section className="screen" aria-label="已鎖定">
        <h1>內容已鎖定</h1>
        <p>{appConfig.paidComingSoon[lang]}</p>
        <p>請返主題頁經家長鎖／問卷解鎖，或喺家長專區開啟問卷。</p>
        <BigButton onClick={() => navigate({ name: 'theme', themeId })}>返回主題</BigButton>
      </section>
    );
  }

  if (activity?.type === 'story') {
    const story = getStory(activityId);
    if (story) {
      return <StoryPlayer story={story} onComplete={completeAndReturn} />;
    }
  }

  if (activity?.type === 'lantern') {
    return <LanternGame onComplete={completeAndReturn} />;
  }

  if (activity?.type === 'puzzle') {
    const config = activity.config as PuzzleConfig | undefined;
    return onScene(<PuzzleGame key={activity.id} config={config} onComplete={completeAndReturn} />);
  }

  if (activity?.type === 'choice' && activity.config) {
    return onScene(
      <ChoiceGame
        key={activity.id}
        config={activity.config as unknown as ChoiceConfig}
        onComplete={completeAndReturn}
      />,
    );
  }

  if (activity?.type === 'zongzi') {
    return onScene(<ZongziGame onComplete={completeAndReturn} />);
  }

  if (activity?.type === 'race') {
    return <RaceGame onComplete={completeAndReturn} />;
  }

  return <ActivityPlaceholder themeId={themeId} activityId={activityId} />;
}
