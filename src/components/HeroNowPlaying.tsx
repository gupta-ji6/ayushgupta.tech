import { useMemo } from 'react';

import {
  PLAYING_INTROS,
  getSpotifyHref,
  itemFromSeed,
} from '@components/music/NowPlayingWidget';
import { useNowPlayingTrack } from '@hooks/useSpotify';

interface HeroNowPlayingProps {
  introSeed?: number;
}

export default function HeroNowPlaying({ introSeed = 0 }: HeroNowPlayingProps) {
  const { data: track } = useNowPlayingTrack();
  const intro = useMemo(
    () => itemFromSeed(PLAYING_INTROS, introSeed),
    [introSeed],
  );

  // Always return a fragment: a bare `null` return makes Astro's React
  // renderer re-probe the component outside a render pass during SSR,
  // logging an "Invalid hook call" warning.
  return (
    <>
      {track?.name ? (
        <p className="hero-now-playing">
          <span className="hero-now-playing-copy">{intro.copy}</span>{' '}
          <a
            className="inline-link"
            href={getSpotifyHref(track)}
            target="_blank"
            rel="noreferrer noopener"
          >
            {track.name}
          </a>
          <span>{' at the moment.'}</span>
        </p>
      ) : null}
    </>
  );
}
