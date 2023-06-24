import { User } from '@prisma/client';
import { DecodedIdToken } from 'firebase-admin/auth';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      decodedIdToken?: DecodedIdToken;
    }
  }
}
