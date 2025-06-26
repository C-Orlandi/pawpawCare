import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DesparasitacionService {

  private desparasitacionesCollection!: AngularFirestoreCollection<any>;

  constructor(private afs: AngularFirestore) {}

  obtenerDesparasitaciones(mid: string): Observable<any[]> {
    this.desparasitacionesCollection = this.afs.collection('desparasitacionesMascotas', ref =>
      ref.where('mid', '==', mid).orderBy('fecha', 'desc')
    );
    return this.desparasitacionesCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const did = a.payload.doc.id;
        return { did, ...data };
      }))
    );
  }

  obtenerDesparasitacionesPorEstado(mid: string): Observable<any[]> {
    this.desparasitacionesCollection = this.afs.collection('desparasitacionesMascotas', ref =>
      ref.where('mid', '==', mid).where('estado', '==', 'aplicada')
    );
    return this.desparasitacionesCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data();
        const did = a.payload.doc.id;
        return { did, ...data };
      }))
    );
  }

  async agregarDesparasitacion(data: any): Promise<void> {
    const docRef = await this.afs.collection('desparasitacionesMascotas').add(data);
    await this.afs.doc(`desparasitacionesMascotas/${docRef.id}`).update({ did: docRef.id });
  }

  async actualizarDesparasitacion(did: string, data: any): Promise<void> {
    await this.afs.doc(`desparasitacionesMascotas/${did}`).update(data);
  }

  async eliminarDesparasitacion(did: string): Promise<void> {
    await this.afs.doc(`desparasitacionesMascotas/${did}`).delete();
  }
}
