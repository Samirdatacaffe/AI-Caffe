import type { IconProps } from '../../types';

export const ChevronDownIcon: React.FC<IconProps> = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <path d="M4 6L8 10L12 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SearchIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="7" cy="7" r="5.25" stroke="#9CA3AF" strokeWidth="1.5" />
    <path d="M11 11L14 14" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const GoogleLogo: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);

export const WindowsLogo: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="#374151">
    <path d="M1 3.2L6.6 2.5V7.5H1V3.2ZM1 8.5H6.6V13.5L1 12.8V8.5ZM7.4 2.4L15 1.3V7.5H7.4V2.4ZM7.4 8.5H15V14.7L7.4 13.6V8.5Z" />
  </svg>
);

export const FolderSvg: React.FC = () => (
  <svg width="56" height="48" viewBox="0 0 56 48" fill="none">
    <path d="M4 12C4 9.79 5.79 8 8 8H18L23 13H48C50.21 13 52 14.79 52 17V38C52 40.21 50.21 42 48 42H8C5.79 42 4 40.21 4 38V12Z" fill="#5BB8F5" />
    <path d="M4 17H52V38C52 40.21 50.21 42 48 42H8C5.79 42 4 40.21 4 38V17Z" fill="#4AABF0" />
  </svg>
);

export const FileDocIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M7 6H13M7 9H13M7 12H10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

export const SkillIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="2" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.4" />
    <rect x="5" y="5" width="4" height="4" rx="0.8" fill="currentColor" />
    <rect x="11" y="5" width="4" height="4" rx="0.8" fill="currentColor" />
    <rect x="5" y="11" width="4" height="4" rx="0.8" fill="currentColor" />
    <rect x="11" y="11" width="4" height="4" rx="0.8" fill="currentColor" />
  </svg>
);

export const ChromeIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4" />
    <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.3" />
    <path d="M10 7L16.5 7" stroke="currentColor" strokeWidth="1.3" />
    <path d="M6.8 11.5L3.5 5.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M13.2 11.5L16.5 17" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);

export const NotionLogo: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M4.7 3.5c.5.4.7.4 1.7.3l9-.6c.2 0 0-.2 0-.2l-1.3-1c-.3-.2-.7-.5-1.4-.4L4 2.3c-.3 0-.4.2-.3.3l1 .9zm.5 1.4v9.5c0 .5.3.7.8.7l9.9-.6c.6 0 .6-.4.6-.8V4.4c0-.4-.2-.6-.5-.6l-10.3.6c-.4 0-.5.2-.5.6zm9.8.5c.1.3 0 .6-.3.6l-.5.1v7c-.4.2-.8.3-1.1.3-.5 0-.6-.2-1-.6L9 8v4.7l1 .2s0 .6-.8.6l-2.2.1c-.1-.1 0-.4.2-.5l.6-.2V6.6l-.8-.1c-.1-.3.1-.7.5-.7l2.4-.2 3.2 4.8V6.2l-.8-.1c-.1-.3.2-.6.5-.6l2.2-.1zM3 2l9.5-.7c1.2-.1 1.5.1 1.9.4l2.7 1.9c.3.2.4.3.4.6v9.8c0 .6-.2 1-1 1.1l-10.6.6c-.6 0-.9-.1-1.2-.4l-2-2.5C2.4 12.3 2 12 2 11.4V3c0-.5.2-.8.7-1z" />
  </svg>
);

export const LinearLogo: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M2.7 11.8l5.5 5.5a8.3 8.3 0 01-5.5-5.5z" fill="#5E6AD2" />
    <path d="M1.7 10a8.3 8.3 0 002.3 6.8A8.3 8.3 0 0010.8 19L1.7 10z" fill="#5E6AD2" />
    <path d="M17.7 7.3L7.3 17.7A8.3 8.3 0 0017.7 7.3z" fill="#5E6AD2" />
    <path d="M18.3 10a8.3 8.3 0 00-2.3-5.8A8.3 8.3 0 0010 1.7V10h8.3z" fill="#5E6AD2" opacity="0.55" />
  </svg>
);
