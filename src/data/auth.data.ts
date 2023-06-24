import { DecodedIdToken, getAuth } from 'firebase-admin/auth';

export async function getDecodedIdToken(
  idToken: string,
): Promise<DecodedIdToken | null> {
  try {
    return await getAuth().verifyIdToken(idToken);
  } catch (err) {
    return null;
  }
}
