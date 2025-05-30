import { hashPassword, generateRandomPassword } from '../utils/bcrypt.js';
import { FireBaseConfig } from '../libs/firebase/index.js';
import User from '../models/User.js';

const fireBaseConfig = new FireBaseConfig();

export const loginGoogle = async (payload) => {
  try {
    const { idToken } = payload;


    const decodedToken = await fireBaseConfig.verifyIdToken(idToken);
    if (!decodedToken) {
      throw new Error('Invalid Google ID token');
    }

    const userLoginGoogle = await User.findOne({ googleId: decodedToken.sub });
    if (userLoginGoogle) {
      userLoginGoogle.isOnline = true;
      await userLoginGoogle.save();
      return userLoginGoogle;
    }

    const foundUserEmail = await User.findOne({ email: decodedToken.email });
    if (foundUserEmail) {
      foundUserEmail.googleId = decodedToken.sub;
      foundUserEmail.picture = decodedToken.picture;
      foundUserEmail.isOnline = true;
      await foundUserEmail.save();
      return foundUserEmail;
    }

    const randomPassword = generateRandomPassword();
    // Send randomPassword to the user via email or other means if needed
    const newUser = new User({
      name: decodedToken.name,
      email: decodedToken.email,
      password: await hashPassword(randomPassword),
      googleId: decodedToken.sub,
      picture: decodedToken.picture,
      role: 'customer',
      isOnline: true,
    });

    await newUser.save();
    return newUser;
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    throw error;
  }
};
