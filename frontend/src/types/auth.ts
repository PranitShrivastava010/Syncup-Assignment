export type AuthRole = "CANDIDATE" | "RECRUITER";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
  createdAt?: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: AuthRole;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterResponse = {
  success: boolean;
  message: string;
  result: AuthUser;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  Result: {
    accessToken: string;
    sendUser: AuthUser;
  };
};

export type StoredAuthSession = {
  accessToken: string;
  user: AuthUser;
};
