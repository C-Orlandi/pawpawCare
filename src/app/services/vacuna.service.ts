import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore'; // solo compat
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VacunaService {

  constructor(private afs: AngularFirestore) {}

  obtenerVacunas(mid: string): Observable<any[]> {
    return this.afs.collection('vacunasMascotas', ref =>
      ref.where('mid', '==', mid).orderBy('fecha', 'desc')
    ).valueChanges({ idField: 'vid' }) as Observable<any[]>;
  }

  obtenerVacunasporEstadp(mid: string): Observable<any[]> {
    return this.afs.collection('vacunasMascotas', ref =>
      ref.where('mid', '==', mid).where('estado', '==', 'aplicada')
    ).valueChanges({ idField: 'vid' }) as Observable<any[]>;
  }

  async agregarVacuna(data: any): Promise<void> {
    const docRef = await this.afs.collection('vacunasMascotas').add(data);
    await this.afs.doc(`vacunasMascotas/${docRef.id}`).update({ vid: docRef.id });
  }

  async actualizarVacuna(vid: string, data: any): Promise<void> {
    await this.afs.doc(`vacunasMascotas/${vid}`).update(data);
  }

  async eliminarVacuna(vid: string): Promise<void> {
    await this.afs.doc(`vacunasMascotas/${vid}`).delete();
  }
}
