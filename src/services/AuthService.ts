import { User } from '../types/auth';

class AuthService {
  login(email: string, _password: string): Promise<User> {
    return Promise.resolve({
      uid: '123',
      email,
      displayName: 'User Name',
      photoURL: null,
      isAdmin: false
    });
  }
  
  signUp(email: string, _password: string): Promise<User> {
    return Promise.resolve({
      uid: '123',
      email,
      displayName: 'New User',
      photoURL: null,
      isAdmin: false
    });
  }
  
  resetPassword(_email: string): Promise<void> {
    return Promise.resolve();
  }
  
  logout(): Promise<void> {
    return Promise.resolve();
  }
}

export default AuthService;
