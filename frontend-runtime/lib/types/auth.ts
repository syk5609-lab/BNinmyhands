export interface AccountProfile {
  bio: string | null;
  avatar_url: string | null;
}

export interface CurrentUser {
  id: number;
  email: string;
  nickname: string;
  role: "user" | "moderator" | "admin" | string;
  status: "active" | "pending" | "restricted" | "disabled" | string;
  email_verified_at: string | null;
  profile: AccountProfile;
}

export interface SignupResponse {
  user: CurrentUser;
  email_verification_required: boolean;
  verification_token_preview: string | null;
}

export interface LoginResponse {
  user: CurrentUser;
}

export interface MessageResponse {
  message: string;
  token_preview: string | null;
}

export interface UpdateProfilePayload {
  nickname?: string;
  bio?: string | null;
  avatar_url?: string | null;
}
