import { User } from '../types/auth';

class AuthService {
  login(email: string, password: string): Promise<User> {
    console.log(`Login with password length: ${password.length}`);
    return Promise.resolve({
      uid: '123',
      email,
      displayName: 'User Name',
      photoURL: null,
      isAdmin: false
    });
  }
  
  signUp(email: string, password: string): Promise<User> {
    console.log(`Signup with password length: ${password.length}`);
    return Promise.resolve({
      uid: '123',
      email,
      displayName: 'New User',
      photoURL: null,
      isAdmin: false
    });
  }
  
  resetPassword(email: string): Promise<void> {
    console.log(`Reset password for: ${email}`);
    return Promise.resolve();
  }
  
  logout(): Promise<void> {
    return Promise.resolve();
  }
}

export default AuthService;
