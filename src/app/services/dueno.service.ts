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

  // Obtener dueños por un array de UIDs
  getDuenosPorUids(uids: string[]): Observable<Dueno[]> {
    return this.afs.collection<Dueno>(this.collectionName, ref =>
      ref.where('uid', 'in', uids)
    ).valueChanges({ idField: 'uid' });
  }

  // Eliminar dueño por UID
  eliminarDueno(uid: string): Promise<void> {
    return this.afs.collection(this.collectionName).doc(uid).delete();
  }

  // Agregar o actualizar un dueño
  guardarDueno(dueno: Dueno): Promise<void> {
    return this.afs.collection(this.collectionName).doc(dueno.uid).set(dueno);
  }

  // Obtener un dueño por UID
  getDuenoPorUid(uid: string): Observable<Dueno | undefined> {
    return this.afs.collection(this.collectionName).doc<Dueno>(uid).valueChanges();
  }
}
