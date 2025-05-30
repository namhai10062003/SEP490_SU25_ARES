import firebaseAdmin from 'firebase-admin';
import path from 'path';

export class FireBaseConfig {
  constructor() {
    const credentialFile =
      process.env.FIRE_BASE_CREDENTIAL_FILE || 'credentials/firebase.json';

    this._validateFilePath(credentialFile);

    const serviceAccountPath = path.join(process.cwd(), credentialFile);

    this.admin = firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(serviceAccountPath),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    this.auth = this.admin.auth();
  }

  _validateFilePath(filePath) {
    if (!filePath) {
      throw new Error('FIRE_BASE_CREDENTIAL_FILE is not defined');
    }
  }

  async verifyIdToken(idToken) {
    try {
      return await this.auth.verifyIdToken(idToken);
    } catch (error) {
      console.error('Error verifying Firebase token:', error);
      throw error;
    }
  }
}
