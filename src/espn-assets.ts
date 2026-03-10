/**
 * ESPN CDN URLs and team colors for NFL Minefield.
 * Team logos: https://a.espncdn.com/i/teamlogos/nfl/500/{abbrev}.png
 * Player headshots: IDs from Sports API (core ref) only; URL format below.
 */

import espnPlayerIds from './data/espn-player-ids.json';

const NFL_TEAM_ABBREV: Record<string, string> = {
  Bills: 'buf',
  Dolphins: 'mia',
  Patriots: 'ne',
  Jets: 'nyj',
  Ravens: 'bal',
  Bengals: 'cin',
  Steelers: 'pit',
  Browns: 'cle',
  Texans: 'hou',
  Colts: 'ind',
  Jaguars: 'jax',
  Titans: 'ten',
  Broncos: 'den',
  Chiefs: 'kc',
  Raiders: 'lv',
  Chargers: 'lac',
  Cowboys: 'dal',
  Giants: 'nyg',
  Eagles: 'phi',
  Commanders: 'wsh',
  Bears: 'chi',
  Lions: 'det',
  Packers: 'gb',
  Vikings: 'min',
  Buccaneers: 'tb',
  Saints: 'no',
  Falcons: 'atl',
  Panthers: 'car',
  Rams: 'la',
  '49ers': 'sf',
  Seahawks: 'sea',
  Cardinals: 'ari',
};

/** NFL team primary color (hex) for glow and hover. */
export const NFL_TEAM_COLORS: Record<string, string> = {
  Bills: '#00338D',
  Dolphins: '#008E97',
  Patriots: '#002244',
  Jets: '#125740',
  Ravens: '#241773',
  Bengals: '#FB4F14',
  Steelers: '#FFB612',
  Browns: '#311D00',
  Texans: '#03202F',
  Colts: '#002C5F',
  Jaguars: '#006778',
  Titans: '#0C2340',
  Broncos: '#FB4F14',
  Chiefs: '#E31837',
  Raiders: '#000000',
  Chargers: '#0080C6',
  Cowboys: '#003594',
  Giants: '#0B2265',
  Eagles: '#004C54',
  Commanders: '#5A1414',
  Bears: '#0B162A',
  Lions: '#0076B6',
  Packers: '#203731',
  Vikings: '#4F2683',
  Buccaneers: '#D50A0A',
  Saints: '#D3BC8D',
  Falcons: '#A71930',
  Panthers: '#0085CA',
  Rams: '#003594',
  '49ers': '#AA0000',
  Seahawks: '#002244',
  Cardinals: '#97233F',
};

const ESPN_LOGO_BASE = 'https://a.espncdn.com/i/teamlogos/nfl/500';
/** Direct ESPN headshot URL; IDs from Sports API core ref only (no hand-coded map). */
const ESPN_HEADSHOT_BASE = 'https://a.espncdn.com/i/headshots/nfl/players/full';

const PLAYER_IDS = espnPlayerIds as Record<string, number>;

export function getTeamLogoUrl(teamNickname: string): string {
  const abbrev = NFL_TEAM_ABBREV[teamNickname] ?? teamNickname.toLowerCase().slice(0, 3);
  return `${ESPN_LOGO_BASE}/${abbrev}.png`;
}

export function getTeamColor(teamNickname: string): string {
  return NFL_TEAM_COLORS[teamNickname] ?? '#404040';
}

/** ESPN headshot when we have an API-sourced player ID; otherwise silhouette. */
export function getPlayerHeadshotUrl(playerName: string): string {
  const id = PLAYER_IDS[playerName];
  if (id != null) return `${ESPN_HEADSHOT_BASE}/${id}.png`;
  return PLAYER_SILHOUETTE_URL;
}

/** Fallback when headshot fails to load or player has no ID. */
export const PLAYER_SILHOUETTE_URL =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120" fill="%23404040"><ellipse cx="50" cy="38" rx="22" ry="24"/><path d="M22 120c0-22 12.5-42 28-42s28 20 28 42H22z"/></svg>'
  );
