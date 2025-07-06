import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AlimentacionService {

  private alimentacionCollection!: AngularFirestoreCollection<any>;

  constructor(private afs: AngularFirestore) {}

  obtenerAlimentacion(mid: string): Observable<any[]> {
    this.alimentacionCollection = this.afs.collection('alimentacionMascotas', ref =>
      ref.where('mid', '==', mid).orderBy('fecha', 'desc')
    );
    return this.alimentacionCollection.snapshotChanges().pipe(
      map(actions => 
        actions.map(a => {
          const data = a.payload.doc.data() as any;
          const aid = a.payload.doc.id;
          return { aid, ...data };
        })
      )
    );
  }

  async eliminarAlimentacion(aid: string): Promise<void> {
    await this.afs.collection('alimentacionMascotas').doc(aid).delete();
  }
}
