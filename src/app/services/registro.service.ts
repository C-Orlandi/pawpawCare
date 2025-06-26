import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore'; // <-- solo compat
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegistroService {
  constructor(private afs: AngularFirestore) {}

  obtenerRegistros(mid: string): Observable<any[]> {
    return this.afs.collection('registrosMedicos', ref =>
      ref.where('mid', '==', mid).orderBy('fechaVisita', 'desc')
    ).valueChanges({ idField: 'rid' }) as Observable<any[]>;
  }

  async agregarRegistro(data: any): Promise<string> {
    const docRef = await this.afs.collection('registrosMedicos').add(data);
    await this.afs.doc(`registrosMedicos/${docRef.id}`).update({ rid: docRef.id });
    return docRef.id;
  }

  async actualizarRegistro(id: string, data: any): Promise<void> {
    await this.afs.doc(`registrosMedicos/${id}`).update(data);
  }

  async eliminarRegistro(id: string): Promise<void> {
    await this.afs.doc(`registrosMedicos/${id}`).delete();
  }

  async agregarRecordatorio(data: any): Promise<void> {
    await this.afs.collection('recordatorios').add(data);
  }
}
