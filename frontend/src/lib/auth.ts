import { getMe, type AuthUser } from "./api";
import { clearAuth, getStoredUser, getToken, saveAuth, updateStoredUser } from "./auth-storage";
import { disconnectSocket } from "./socket";

export {
  clearAuth,
  getStoredUser,
  getToken,
  saveAuth,
  updateStoredUser,
};

export function logout(): void {
  clearAuth();
  disconnectSocket();
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const { user } = await getMe(token);
    saveAuth(token, user);
    return user;
  } catch {
    clearAuth();
    return null;
  }
}

export const getCurrentUser = fetchCurrentUser;

export type { AuthUser };
