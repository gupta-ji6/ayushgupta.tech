import type { SpotifyTrack } from '@utils/spotify';

export interface WidgetContextLine {
  emoji: string;
  copy: string;
}

const SPOTIFY_PROFILE =
  'https://open.spotify.com/user/31yuvamoxkbmkpvhpunh6xwoshii';

export const PLAYING_INTROS: WidgetContextLine[] = [
  { emoji: '💫', copy: 'vibing to' },
  { emoji: '🎵', copy: 'listening to' },
  { emoji: '😇', copy: 'tripping on' },
  { emoji: '🥰', copy: 'mushing over' },
  { emoji: '🙈', copy: 'gushing over' },
  { emoji: '🗣', copy: 'lip syncing to' },
  { emoji: '👻', copy: 'quietly murmuring' },
];

export function itemFromSeed<T>(items: T[], seed: number) {
  const index = Math.floor(seed * items.length) % items.length;
  return items[index] ?? items[0]!;
}

export function getSpotifyHref(track: SpotifyTrack | null) {
  return track?.spotifyUrl ?? SPOTIFY_PROFILE;
}
