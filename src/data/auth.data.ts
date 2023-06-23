import { getAuth } from 'firebase-admin/auth';

export async function getFirebaseUid(idToken: string): Promise<string | null> {
  try {
    const token = await getAuth().verifyIdToken(idToken);
    return token.uid;
  } catch (err) {
    console.log(err);
    return null;
  }
}
