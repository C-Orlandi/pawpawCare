import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Usuario } from '../interfaces/usuario';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private collectionName = 'usuarios';
  private apiUrl = environment.backendUrl;

  constructor(
    private firestore: AngularFirestore,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  getUsuarios(): Observable<Usuario[]> {
    return this.firestore.collection<Usuario>(this.collectionName).valueChanges({ idField: 'uid' });
  }

  getUsuarioPorUid(uid: string): Observable<Usuario | undefined> {
    return this.firestore.doc<Usuario>(`${this.collectionName}/${uid}`).valueChanges({ idField: 'uid' });
  }

  crearUsuario(usuario: Usuario): Promise<void> {
    return this.firestore.doc(`${this.collectionName}/${usuario.uid}`).set(usuario);
  }

  actualizarUsuario(usuario: Usuario): Promise<void> {
    const { uid, ...data } = usuario;
    return this.firestore.doc(`${this.collectionName}/${uid}`).update(data);
  }

  async eliminarUsuario(uid: string): Promise<void> {
    try {
      await this.firestore.doc(`usuarios/${uid}`).delete();
      await this.firestore.doc(`duenos/${uid}`).delete();

      await this.authService.eliminarUsuarioPorUid(uid).toPromise();

    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    }
  }

  actualizarPerfil(data: {
    uid: string,
    email?: string,
    password?: string,
    nombre?: string,
    contacto?: string
  }): Observable<any> {
    return this.http.put(`${this.apiUrl}/usuarios/perfil`, data);
  }

  eliminarUsuarioPerfil(uid: string): Promise<void> {
    const usuariosDocRef = this.firestore.doc(`usuarios/${uid}`);
    const duenosDocRef = this.firestore.doc(`duenos/${uid}`);

    return Promise.all([
      usuariosDocRef.delete(),
      duenosDocRef.delete(),
      this.http.delete(`${this.apiUrl}/usuarios/${uid}`).toPromise()
    ]).then(() => {});
  }
}
