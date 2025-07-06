import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { Dueno } from '../interfaces/dueno';

@Injectable({
  providedIn: 'root'
})
export class DuenoService {

  private collectionName = 'duenos';

  constructor(private afs: AngularFirestore) {}

  // Obtener todos los dueños
  getDuenos(): Observable<Dueno[]> {
    return this.afs.collection<Dueno>(this.collectionName).valueChanges({ idField: 'uid' });
  }

  getDuenosPorUids(uids: string[]): Observable<Dueno[]> {
    return this.afs.collection<Dueno>(this.collectionName, ref =>
      ref.where('uid', 'in', uids)
    ).valueChanges({ idField: 'uid' });
  }

  // Eliminar dueño por uid
  eliminarDueno(uid: string): Promise<void> {
    return this.afs.collection(this.collectionName).doc(uid).delete();
  }

  guardarDueno(dueno: Dueno): Promise<void> {
    return this.afs.collection(this.collectionName).doc(dueno.uid).set(dueno);
  }

  getDuenoPorUid(uid: string): Observable<Dueno | undefined> {
    return this.afs.collection(this.collectionName).doc<Dueno>(uid).valueChanges();
  }
}
