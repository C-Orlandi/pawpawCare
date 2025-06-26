import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';  // <-- compat import
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecordatorioService {
  constructor(private afs: AngularFirestore) {}

  // Filtrar por UID
  getRecordatoriosPorUsuario(uid: string): Observable<any[]> {
    return this.afs.collection('recordatorios', ref =>
      ref.where('uid', '==', uid)
    ).valueChanges({ idField: 'rid' }) as Observable<any[]>;
  }

  // Filtrar por mid con orden descendente
  obtenerRecordatoriosPorMid(mid: string): Observable<any[]> {
    return this.afs.collection('recordatorios', ref =>
      ref.where('mid', '==', mid).orderBy('creadoEn', 'desc')
    ).valueChanges({ idField: 'rid' }) as Observable<any[]>;
  }

  async agregarRecordatorio(data: any): Promise<void> {
    const docRef = await this.afs.collection('recordatorios').add(data);
    await this.afs.doc(`recordatorios/${docRef.id}`).update({ rid: docRef.id });
  }

  async actualizarRecordatorio(rid: string, data: any): Promise<void> {
    await this.afs.doc(`recordatorios/${rid}`).update(data);
  }

  async eliminarRecordatorio(rid: string): Promise<void> {
    await this.afs.doc(`recordatorios/${rid}`).delete();
  }
}
