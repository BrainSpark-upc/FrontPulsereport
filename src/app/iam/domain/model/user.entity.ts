/**
 * @author: Alexander Auden Aliaga Ocampo
 * codigo:U202417693
 */

export enum UserRole {
  NURSE = 'NURSE',
  HEAD_NURSE = 'HEAD_NURSE',
  DOCTOR = 'DOCTOR',
  ADMIN = 'ADMIN',
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.NURSE]: 'Nurse',
  [UserRole.HEAD_NURSE]: 'Head nurse',
  [UserRole.DOCTOR]: 'Doctor',
  [UserRole.ADMIN]: 'Admin',
};

export function normalizeUserRole(role: string | null | undefined): UserRole {
  const normalized = String(role ?? '')
    .trim()
    .replace(/[\s-]+/g, '_')
    .toUpperCase();

  if (normalized === 'HEADNURSE') return UserRole.HEAD_NURSE;
  if (normalized === 'HEAD_NURSE') return UserRole.HEAD_NURSE;
  if (normalized === 'DOCTOR') return UserRole.DOCTOR;
  if (normalized === 'ADMIN') return UserRole.ADMIN;
  return UserRole.NURSE;
}

export class User {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly role: UserRole,
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get roleLabel(): string {
    return USER_ROLE_LABELS[this.role];
  }

  get isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }
}
