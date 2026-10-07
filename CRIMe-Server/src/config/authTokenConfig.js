export const ACCESS_TOKEN_TTL = "15m";
export const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
export const REFRESH_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export function getSessionExpiresAt(user) {
  const refreshExpiresAt = user.refreshTokenExpiresAt;
  if (!refreshExpiresAt) {
    return null;
  }

  const absoluteExpiresAt = user.lastLogin
    ? new Date(user.lastLogin.getTime() + REFRESH_TOKEN_TTL_MS)
    : refreshExpiresAt;

  return refreshExpiresAt < absoluteExpiresAt
    ? refreshExpiresAt
    : absoluteExpiresAt;
}
