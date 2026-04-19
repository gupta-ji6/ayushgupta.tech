import type { SVGProps } from 'react';

function IconBase(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M20 6 9 17l-5-5" />
    </IconBase>
  );
}

export function MusicNoteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M9 18V6l10-2v12" />
      <circle cx="6" cy="18" r="2.5" />
      <circle cx="16" cy="16" r="2.5" />
    </IconBase>
  );
}

export function PauseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="M9 6v12" />
      <path d="M15 6v12" />
    </IconBase>
  );
}

export function PlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <IconBase {...props}>
      <path d="m8 6 10 6-10 6Z" fill="currentColor" stroke="none" />
    </IconBase>
  );
}

export function SpotifyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 168 168"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M84 0a84 84 0 1 0 0 168 84 84 0 0 0 0-168Zm38.52 121.18a5.23 5.23 0 0 1-7.2 1.72c-19.73-12.05-44.57-14.77-73.84-8.09a5.23 5.23 0 1 1-2.33-10.2c32.04-7.31 59.6-4.18 81.62 9.28a5.23 5.23 0 0 1 1.75 7.29Zm10.28-22.88a6.54 6.54 0 0 1-8.98 2.15c-22.58-13.88-57.04-17.9-83.74-9.76a6.54 6.54 0 1 1-3.82-12.51c30.5-9.29 68.4-4.78 94.4 11.2a6.54 6.54 0 0 1 2.14 8.92Zm.88-23.83c-27.07-16.08-71.75-17.56-97.59-9.03a7.84 7.84 0 1 1-4.92-14.89c29.67-9.81 79.01-7.92 110.53 10.84a7.84 7.84 0 0 1-8.02 13.08Z" />
    </svg>
  );
}
