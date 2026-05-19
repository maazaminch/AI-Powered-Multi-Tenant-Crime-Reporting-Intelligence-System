// utils/resolveActorRole.js

export const resolveActorRole = (user) => {

  if (!user) return "GUEST";

  if (user.isSuperAdmin) {
    return "SUPER_ADMIN";
  }

  if (user.isStationHead) {
    return "STATION_HEAD";
  }

  if (user.isGuest) {
    return "GUEST";
  }

  return user.role;
};