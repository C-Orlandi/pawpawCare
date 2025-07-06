import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private backendUrl = environment.backendUrl;

  constructor(private afAuth: AngularFireAuth, private http: HttpClient) {}

  login(email: string, password: string) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  getCurrentUser() {
    return this.afAuth.currentUser;
  }

  register(email: string, password: string) {
    return this.afAuth.createUserWithEmailAndPassword(email, password);
  }

  logout() {
    return this.afAuth.signOut();
  }

  recoveryPassword(email: string) {
    return this.afAuth.sendPasswordResetEmail(email);
  }

  eliminarUsuarioPorUid(uid: string) {
    return this.http.delete(`${this.backendUrl}/usuarios/${uid}`);
  }

  actualizarUsuarioEnAuth(uid: string, email: string, password: string) {
    return this.http.put(`${this.backendUrl}/usuarios`, { uid, email, password });
  }
}
