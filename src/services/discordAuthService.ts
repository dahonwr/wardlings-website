export const SUPABASE_DISCORD_AUTH_URL =
  'https://osyvztzqmtimbefklcsn.supabase.co/functions/v1/discord-auth';

export const DISCORD_GUILD_ID = '1515320775324995785';

export const DISCORD_INVITE_URL = 'https://discord.com/invite/AXjAt95DK';

export const ALLOCATION_ROLES = {
  OG: {
    allocation: 'OG',
    roleName: 'Wardlings',
    roleId: '1515329267712528516',
    description: 'OG Allocation receives the Wardlings role in the Sanctuary.'
  },
  FCFS: {
    allocation: 'FCFS',
    roleName: 'Chosen',
    roleId: '1515335932696592546',
    description: 'FCFS Allocation receives the Chosen role in the Sanctuary.'
  },
  GTD: {
    allocation: 'GTD',
    roleName: 'Keepers',
    roleId: '1536037496222122085',
    description: 'GTD Allocation receives the Keepers role in the Sanctuary.'
  }
} as const;

export type AllocationType = 'OG' | 'FCFS' | 'GTD';

export interface DiscordUser {
  id?: string;
  username?: string;
  discriminator?: string;
  global_name?: string;
  avatar?: string;
  avatarUrl?: string;
}

export interface DiscordAuthResult {
  success: boolean;
  isMember?: boolean;
  role?: AllocationType | null;
  roleName?: string | null;
  roleStatus?: 'already_assigned' | 'assigned' | 'eligible';
  roles?: string[];
  user?: DiscordUser | null;
  error?: string;
}

/**
 * Gets role info for a given allocation type.
 */
export function getRoleInfo(allocation?: string | null) {
  if (!allocation) return null;
  const upper = allocation.trim().toUpperCase();
  if (upper.includes('OG')) return ALLOCATION_ROLES.OG;
  if (upper.includes('FCFS')) return ALLOCATION_ROLES.FCFS;
  if (upper.includes('GTD') || upper.includes('GUARANTEED')) return ALLOCATION_ROLES.GTD;
  return null;
}

/**
 * Resolves the highest-priority eligible allocation from role IDs or strings.
 */
export function resolveDiscordRole(roles: (string | number)[] = []): AllocationType | null {
  const strRoles = roles.map(r => String(r).trim().toLowerCase());

  if (
    strRoles.includes(ALLOCATION_ROLES.OG.roleId.toLowerCase()) ||
    strRoles.includes('wardlings') ||
    strRoles.includes('og')
  ) {
    return 'OG';
  }

  if (
    strRoles.includes(ALLOCATION_ROLES.FCFS.roleId.toLowerCase()) ||
    strRoles.includes('chosen') ||
    strRoles.includes('fcfs')
  ) {
    return 'FCFS';
  }

  if (
    strRoles.includes(ALLOCATION_ROLES.GTD.roleId.toLowerCase()) ||
    strRoles.includes('keepers') ||
    strRoles.includes('gtd') ||
    strRoles.includes('guaranteed')
  ) {
    return 'GTD';
  }

  return null;
}

/**
 * Builds the Discord OAuth2 authorization URL with required scopes:
 * `identify` and `guilds.members.read`.
 */
export function buildDiscordOAuthUrl(customState?: Record<string, any>): string {
  const env = (import.meta as any).env || {};
  const clientId =
    env.VITE_DISCORD_CLIENT_ID ||
    env.DISCORD_CLIENT_ID ||
    '1515320775324995785';

  const redirectUri = SUPABASE_DISCORD_AUTH_URL;
  const scope = 'identify guilds.members.read';

  const statePayload = {
    origin: typeof window !== 'undefined' ? window.location.origin : '',
    returnUrl: typeof window !== 'undefined' ? window.location.href.split('#')[0] : '',
    guildId: DISCORD_GUILD_ID,
    timestamp: Date.now(),
    ...customState
  };

  let stateParam = '';
  try {
    stateParam = btoa(unescape(encodeURIComponent(JSON.stringify(statePayload))));
  } catch (e) {
    stateParam = String(Date.now());
  }

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: scope,
    state: stateParam,
    prompt: 'consent'
  });

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

/**
 * Formats Discord user avatar URL safely.
 */
export function getDiscordAvatarUrl(user?: DiscordUser | null): string | null {
  if (!user?.id) return null;
  if (user.avatarUrl) return user.avatarUrl;
  if (user.avatar) {
    const isGif = user.avatar.startsWith('a_');
    const ext = isGif ? 'gif' : 'png';
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128`;
  }
  const index = user.discriminator && user.discriminator !== '0'
    ? Number(user.discriminator) % 5
    : (BigInt(user.id) >> 22n) % 6n;
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}
