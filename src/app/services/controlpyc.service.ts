import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ControlpycService {
  private coleccion: AngularFirestoreCollection<any>;

  constructor(private afs: AngularFirestore) {
    this.coleccion = this.afs.collection('controlPesoCrecimiento');
  }

  obtenerControles(mid: string): Observable<any[]> {
    // Filtrar por mid y ordenar por fecha descendente
    return this.afs.collection('controlPesoCrecimiento', ref => 
      ref.where('mid', '==', mid).orderBy('fecha', 'desc')
    ).snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as any;
        const cid = a.payload.doc.id;
        return { cid, ...data };
      }))
    );
  }

  async agregarControl(data: any): Promise<void> {
    const docRef = await this.coleccion.add(data);
    // Actualizar el campo cid con el id generado
    await this.coleccion.doc(docRef.id).update({ cid: docRef.id });
  }

  async actualizarControl(cid: string, data: any): Promise<void> {
    const docRef: AngularFirestoreDocument<any> = this.coleccion.doc(cid);
    await docRef.update(data);
  }

  async eliminarControl(cid: string): Promise<void> {
    const docRef: AngularFirestoreDocument<any> = this.coleccion.doc(cid);
    await docRef.delete();
  }
}
