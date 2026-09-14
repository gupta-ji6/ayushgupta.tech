/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SPOTIFY_CLIENT_ID?: string;
  readonly SPOTIFY_CLIENT_SECRET?: string;
  readonly SPOTIFY_REFRESH_TOKEN?: string;
  readonly SUPABASE_URL?: string;
  readonly SUPABASE_KEY?: string;
}
