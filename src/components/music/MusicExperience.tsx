import {
  useEffect,
  useState,
  type ChangeEvent,
  type ReactNode,
  type SubmitEvent,
} from 'react';
import { toast } from 'react-hot-toast';

import Notifications from '@components/Notifications';
import { useComments } from '@hooks/useComments';
import {
  useFavouritePlaylist,
  useRecentlyPlayedTracks,
  useSavedTracks,
  useTopSpotifyItems,
  useUserPlaylists,
} from '@hooks/useSpotify';
import {
  getPlaylistTrackTotal,
  pickSpotifyCoverImage,
  type SpotifyArtist,
  type SpotifyPlaylist,
  type SpotifyRecentlyPlayedItem,
  type SpotifySavedTrackItem,
  type SpotifyTrack,
} from '@utils/spotify';

import { CheckIcon } from './icons';
import NowPlayingWidget from './NowPlayingWidget';
import './music.css';

type SpotifyTimeRange = 'short_term' | 'medium_term' | 'long_term';

interface QueryState<T> {
  data: T;
  error: string | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

interface DisclosureSectionProps {
  children: ReactNode;
  controls?: ReactNode;
  subtitle: string;
  title: string;
}

const TIME_RANGE_OPTIONS: Array<{
  label: string;
  value: SpotifyTimeRange;
}> = [
  { label: 'Last Month', value: 'short_term' },
  { label: 'Last 6 Months', value: 'medium_term' },
  { label: 'All Time', value: 'long_term' },
];

function ExternalLink({
  children,
  href,
}: {
  children: ReactNode;
  href?: string;
}) {
  if (!href) {
    return <span>{children}</span>;
  }

  return (
    <a href={href} target="_blank" rel="noreferrer noopener">
      {children}
    </a>
  );
}

function DisclosureSection({
  children,
  controls,
  subtitle,
  title,
}: DisclosureSectionProps) {
  // Sections start closed, so defer mounting their content (and the
  // Spotify fetches inside) until the section is first opened.
  const [hasOpened, setHasOpened] = useState(false);

  return (
    <section className="disclosure">
      <details
        onToggle={(event) => {
          if (event.currentTarget.open) {
            setHasOpened(true);
          }
        }}
      >
        <summary>
          <span className="medium-heading disclosure-title">{title}</span>
          <p className="disclosure-subtitle">{subtitle}</p>
        </summary>

        <div className="disclosure-body">
          {hasOpened ? (
            <>
              {controls}
              {children}
            </>
          ) : null}
        </div>
      </details>
    </section>
  );
}

function TimeRangeControls({
  onChange,
  selectedRange,
}: {
  onChange: (_value: SpotifyTimeRange) => void;
  selectedRange: SpotifyTimeRange;
}) {
  return (
    <div className="music-range-buttons">
      {TIME_RANGE_OPTIONS.map((option) => {
        const isActive = option.value === selectedRange;

        return (
          <button
            key={option.value}
            type="button"
            className={`music-range-button ${isActive ? 'is-active' : ''}`}
            onClick={() => onChange(option.value)}
          >
            {isActive && <CheckIcon />}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ResourceState<T>({
  emptyLabel,
  loadingLabel,
  query,
  children,
}: {
  children: (_data: T) => ReactNode;
  emptyLabel: string;
  loadingLabel: string;
  query: QueryState<T>;
}) {
  if (query.loading) {
    return <div className="music-feedback">{loadingLabel}</div>;
  }

  if (query.error) {
    return (
      <div className="music-feedback music-feedback-error">
        <p>{query.error}</p>
        <button type="button" onClick={() => void query.refetch()}>
          Retry
        </button>
      </div>
    );
  }

  if (
    query.data == null ||
    (Array.isArray(query.data) && query.data.length === 0)
  ) {
    return <div className="music-feedback">{emptyLabel}</div>;
  }

  return <>{children(query.data)}</>;
}

function MusicRow({
  children,
  coverAlt,
  coverImage,
}: {
  children: ReactNode;
  coverAlt: string;
  coverImage: ReturnType<typeof pickSpotifyCoverImage>;
}) {
  return (
    <article className="music-row">
      {coverImage ? (
        <img
          className="music-cover"
          src={coverImage.url}
          width={coverImage.width ?? 128}
          height={coverImage.height ?? 128}
          loading="lazy"
          alt={coverAlt}
        />
      ) : (
        <div
          className="music-cover music-cover-placeholder"
          aria-hidden="true"
        />
      )}

      <div className="music-card">{children}</div>
    </article>
  );
}

function TrackList({
  prefix,
  tracks,
}: {
  prefix: string;
  tracks: SpotifyTrack[];
}) {
  return (
    <div className="music-list">
      {tracks.map((track, index) => {
        const artists = (track.artists ?? [])
          .map((artist) => artist.name)
          .join(', ');

        return (
          <MusicRow
            key={track.id ?? `${prefix}-${index}`}
            coverAlt={`${track.album?.name ?? track.name} album cover`}
            coverImage={pickSpotifyCoverImage(track.album?.images)}
          >
            <ExternalLink href={track.external_urls?.spotify}>
              {track.name}
            </ExternalLink>
            <p>{artists}</p>
          </MusicRow>
        );
      })}
    </div>
  );
}

function ArtistList({ artists }: { artists: SpotifyArtist[] }) {
  return (
    <div className="music-list">
      {artists.map((artist, index) => (
        <MusicRow
          key={artist.id ?? `artist-${index}`}
          coverAlt={`${artist.name} artist image`}
          coverImage={pickSpotifyCoverImage(artist.images)}
        >
          <ExternalLink href={artist.external_urls?.spotify}>
            {artist.name}
          </ExternalLink>
          <p>{(artist.genres ?? []).join(', ')}</p>
        </MusicRow>
      ))}
    </div>
  );
}

function PlaylistList({
  playlists,
  prefix,
}: {
  playlists: SpotifyPlaylist[];
  prefix: string;
}) {
  return (
    <div className="music-list">
      {playlists.map((playlist, index) => {
        const total = getPlaylistTrackTotal(playlist);

        return (
          <MusicRow
            key={playlist.id ?? `${prefix}-${index}`}
            coverAlt={`${playlist.name} playlist cover`}
            coverImage={pickSpotifyCoverImage(playlist.images)}
          >
            <div className="music-card-heading">
              <ExternalLink href={playlist.external_urls?.spotify}>
                {playlist.name}
              </ExternalLink>
              {playlist.owner?.display_name && (
                <span> by {playlist.owner.display_name}</span>
              )}
            </div>
            <p>{total == null ? '' : `${total} tracks`}</p>
          </MusicRow>
        );
      })}
    </div>
  );
}

function TopTracksPanel({ range }: { range: SpotifyTimeRange }) {
  const query = useTopSpotifyItems('tracks', range, 10);

  return (
    <ResourceState
      query={query as QueryState<SpotifyTrack[]>}
      loadingLabel="Loading Ayush's top tracks..."
      emptyLabel="No top tracks are available right now."
    >
      {(tracks) => <TrackList prefix="top-track" tracks={tracks} />}
    </ResourceState>
  );
}

function FavouritePlaylistPanel() {
  const query = useFavouritePlaylist();

  return (
    <ResourceState
      query={query as QueryState<SpotifyPlaylist | null>}
      loadingLabel="Loading favourite playlist..."
      emptyLabel="Favourite playlist is unavailable right now."
    >
      {(playlist) => (
        <PlaylistList
          prefix="favourite-playlist"
          playlists={playlist ? [playlist] : []}
        />
      )}
    </ResourceState>
  );
}

function RecentlyPlayedPanel() {
  const query = useRecentlyPlayedTracks(10);

  return (
    <ResourceState
      query={query as QueryState<SpotifyRecentlyPlayedItem[]>}
      loadingLabel="Loading recently played tracks..."
      emptyLabel="No recent listening history is available right now."
    >
      {(items) => (
        <TrackList
          prefix="recent-track"
          tracks={items
            .map((item) => item.track)
            .filter((track): track is SpotifyTrack => Boolean(track?.name))}
        />
      )}
    </ResourceState>
  );
}

function SavedTracksPanel() {
  const query = useSavedTracks(10);

  return (
    <ResourceState
      query={query as QueryState<SpotifySavedTrackItem[]>}
      loadingLabel="Loading recently saved tracks..."
      emptyLabel="No recently saved tracks are available right now."
    >
      {(items) => (
        <TrackList
          prefix="saved-track"
          tracks={items
            .map((item) => item.track)
            .filter((track): track is SpotifyTrack => Boolean(track?.name))}
        />
      )}
    </ResourceState>
  );
}

function TopArtistsPanel({ range }: { range: SpotifyTimeRange }) {
  const query = useTopSpotifyItems('artists', range, 10);

  return (
    <ResourceState
      query={query as QueryState<SpotifyArtist[]>}
      loadingLabel="Loading Ayush's top artists..."
      emptyLabel="No top artists are available right now."
    >
      {(artists) => <ArtistList artists={artists} />}
    </ResourceState>
  );
}

function SavedPlaylistsPanel() {
  const query = useUserPlaylists(10);

  return (
    <ResourceState
      query={query as QueryState<SpotifyPlaylist[]>}
      loadingLabel="Loading saved playlists..."
      emptyLabel="No saved playlists are available right now."
    >
      {(playlists) => (
        <PlaylistList prefix="saved-playlist" playlists={playlists} />
      )}
    </ResourceState>
  );
}

interface MusicExperienceProps {
  introSeed?: number;
}

export default function MusicExperience({
  introSeed = 0,
}: MusicExperienceProps) {
  const [topTracksRange, setTopTracksRange] =
    useState<SpotifyTimeRange>('short_term');
  const [topArtistsRange, setTopArtistsRange] =
    useState<SpotifyTimeRange>('short_term');
  const [isRevealed, setIsRevealed] = useState(false);

  const { addComment, count } = useComments('/music/');
  const [songRecommendationData, setSongRecommendationData] = useState({
    authorName: '',
    comment: '',
  });

  const onNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSongRecommendationData((oldCommentData) => ({
      ...oldCommentData,
      authorName: event.target.value,
    }));
  };

  const onCommentChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSongRecommendationData((oldCommentData) => ({
      ...oldCommentData,
      comment: event.target.value,
    }));
  };

  const onSongSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    addComment({
      content: songRecommendationData.comment,
      author: songRecommendationData.authorName,
    });
    toast.success(
      'People who recommend songs are invaluable. You are my precious!',
      {
        duration: 5000,
      },
    );
    setSongRecommendationData({
      authorName: '',
      comment: '',
    });
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsRevealed(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="music-page">
      <header
        className={`music-header page-reveal ${isRevealed ? 'is-revealed' : ''}`}
      >
        <h1 className="big-heading">Music</h1>
        <p className="subtitle">deep dive into my music library</p>
      </header>

      <section
        className={`music-content page-reveal ${isRevealed ? 'is-revealed' : ''}`}
      >
        <div className="music-now-playing-panel">
          <NowPlayingWidget mode="page" introSeed={introSeed} />
        </div>

        <DisclosureSection
          title="Top Tracks"
          subtitle="Top tracks I have jammed to. Some put me to sleep while some made me dance."
          controls={
            <TimeRangeControls
              selectedRange={topTracksRange}
              onChange={setTopTracksRange}
            />
          }
        >
          <TopTracksPanel range={topTracksRange} />
        </DisclosureSection>

        <DisclosureSection
          title="Favourite Playlist"
          subtitle="A playlist I would not share with just anyone. It started as a late-night companion and grew into a collection of feel-good and indie songs."
        >
          <FavouritePlaylistPanel />
        </DisclosureSection>

        <DisclosureSection
          title="Recently Played"
          subtitle="Recent tracks I played while discovering new music, or maybe listening to the same old shiz for the nth time."
        >
          <RecentlyPlayedPanel />
        </DisclosureSection>

        <DisclosureSection
          title="Recently Saved Tracks"
          subtitle="Spotify still does not let us share liked songs as a playlist, so this is the next best thing."
        >
          <SavedTracksPanel />
        </DisclosureSection>

        <DisclosureSection
          title="Top Artists"
          subtitle="Top artists I looped on. I am more of an indie guy but the list does not always suggest so."
          controls={
            <TimeRangeControls
              selectedRange={topArtistsRange}
              onChange={setTopArtistsRange}
            />
          }
        >
          <TopArtistsPanel range={topArtistsRange} />
        </DisclosureSection>

        <DisclosureSection
          title="Recently Saved Playlists"
          subtitle="Some playlists are too precious not to save."
        >
          <SavedPlaylistsPanel />
        </DisclosureSection>
      </section>

      <section className="music-cta">
        <h2>Have similar music taste?</h2>
        <p>
          Fill the form below or recommend me your favorite songs on{' '}
          <a
            className="music-inline-link"
            href="https://x.com/_guptaji_"
            target="_blank"
            rel="noreferrer noopener"
          >
            twitter
          </a>{' '}
          or{' '}
          <a
            className="music-inline-link"
            href="https://www.instagram.com/_.guptaji._/"
            target="_blank"
            rel="noreferrer noopener"
          >
            instagram
          </a>
          .
        </p>

        <form onSubmit={onSongSubmit}>
          <fieldset className="music-recommendation-fieldset">
            <legend>recommend a song to ayush</legend>
            <div className="music-recommendation-count">
              {count} people have suggested songs which ayush liked!
            </div>
            <div className="music-recommendation-entry">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                placeholder="Your name or handle"
                onChange={onNameChange}
                value={songRecommendationData.authorName}
                required
              />
            </div>
            <div className="music-recommendation-entry">
              <label htmlFor="song">Song</label>
              <input
                id="song"
                type="text"
                placeholder="Track name or link"
                onChange={onCommentChange}
                value={songRecommendationData.comment}
                required
              />
            </div>
            <button type="submit" className="big-button">
              Send Recommendation
            </button>
          </fieldset>
        </form>
      </section>

      <Notifications />
    </div>
  );
}
