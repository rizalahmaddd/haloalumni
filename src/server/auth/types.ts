export type Role = 'alumni' | 'editor' | 'admin';
export type UserStatus = 'pending' | 'active' | 'suspended';

export interface SessionUser {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  profile: {
    id: string;
    slug: string;
    fullName: string;
    angkatan: number;
    program: string | null;
    cardNo: string | null;
    cardToken: string | null;
    status: 'draft' | 'published' | 'hidden';
  } | null;
}

export function isEditor(user: SessionUser | null | undefined): boolean {
  return user?.role === 'editor' || user?.role === 'admin';
}

export function isAdmin(user: SessionUser | null | undefined): boolean {
  return user?.role === 'admin';
}
