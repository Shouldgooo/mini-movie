type UserRecord = {
  id: number;
  username: string;
  displayName: string | null;
  email: string;
  createdAt?: string;
};

export function toAuthUser(user: UserRecord) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
  };
}

export function toCurrentUser(user: UserRecord) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export function toPublicUser(user: {
  id: number;
  username: string;
  displayName: string | null;
}) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
  };
}
