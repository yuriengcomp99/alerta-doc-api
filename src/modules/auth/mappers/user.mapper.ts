import type { AuthUser, UserRole } from "../types/auth.types.js";

export type UserRecord = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  passwordHash?: string;
  active?: boolean;
};

export function toAuthUser(user: UserRecord): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
  };
}
