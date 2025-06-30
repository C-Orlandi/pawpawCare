import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class EmailService {
  private backendUrl = `${environment.backendUrl}/enviar-email-recordatorio`;

  constructor(private http: HttpClient) {}

  enviarEmailRecordatorio(data: {
    email: string;
    tipo: 'medicamento' | 'vacuna' | 'desparasitacion';
    datos: any;
  }) {
    return this.http.post(this.backendUrl, data);
  }
}
