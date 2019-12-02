import { Request } from 'express'

export interface AuthenticatedRequest extends Request {
  token: {
    exp: number,
    iat: number,
    user: number,
  }
}
