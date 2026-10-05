import type { Request } from 'express';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthedRequest extends Request {
  user?: AuthUser;
}
