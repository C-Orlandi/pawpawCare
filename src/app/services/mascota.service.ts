import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Injectable } from '@angular/core';
import { Mascota } from '../interfaces/mascota';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MascotaService {

  private coleccion = 'mascotas';

  constructor(private firestore: AngularFirestore) {}

  getMascotas(): Observable<Mascota[]> {
    return this.firestore.collection<Mascota>(this.coleccion).valueChanges({ idField: 'mid' });
  }

  getMascotasPorUsuario(uid: string): Observable<Mascota[]> {
    return this.firestore.collection<Mascota>(this.coleccion, ref =>
      ref.where('usuarioUid', '==', uid)
    ).valueChanges({ idField: 'mid' });
  }

  getMascotaPorId(mid: string): Observable<Mascota | undefined> {
    return this.firestore.doc<Mascota>(`${this.coleccion}/${mid}`).valueChanges();
  }

  crearMascota(mascota: Mascota): Promise<void> {
    return this.firestore.doc(`${this.coleccion}/${mascota.mid}`).set(mascota);
  }

  actualizarMascota(mascota: Mascota): Promise<void> {
    return this.firestore.doc(`${this.coleccion}/${mascota.mid}`).update({ ...mascota });
  }

  eliminarMascota(mid: string): Promise<void> {
    return this.firestore.doc(`${this.coleccion}/${mid}`).delete();
  }
}
