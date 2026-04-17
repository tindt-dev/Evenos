export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
};

export type AuthenticatedRequestUser = {
  userId: string;
  email: string;
  role: string;
};
