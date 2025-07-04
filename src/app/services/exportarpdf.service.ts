import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { Capacitor } from '@capacitor/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ExportarpdfService {
  constructor(
    private http: HttpClient,
    private loadingController: LoadingController
  ) {}

  private capitalize(text?: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  private agregarEncabezado(doc: jsPDF, titulo: string) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(titulo, 10, 15);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(16);
    doc.text('PawCare', 190, 15, { align: 'right' });

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.8);
    doc.line(10, 18, 200, 18);
  }

  private async procesarPDF(doc: jsPDF, nombreArchivo: string, asuntoEmail: string) {
    if (Capacitor.getPlatform() !== 'web') {
      const pdfOutput = doc.output('datauristring');
      const base64Data = pdfOutput.split(',')[1];

      const usuarioRaw = localStorage.getItem('usuarioLogin');
      const email = usuarioRaw ? JSON.parse(usuarioRaw).email : null;

      if (!email) {
        await Swal.fire({
          icon: 'error',
          title: 'Usuario no válido',
          text: 'No se encontró el correo electrónico del usuario.',
          confirmButtonText: 'OK',
          heightAuto: false
        });
        return;
      }

      const payload = { email, asunto: asuntoEmail, nombreArchivo, pdfBase64: base64Data };

      const loading = await this.loadingController.create({ message: 'Enviando PDF...', spinner: 'circles' });
      await loading.present();

      this.http.post(`${environment.backendUrl}/enviar-pdf`, payload).subscribe({
        next: async () => {
          await loading.dismiss();
          await Swal.fire({
            icon: 'success',
            title: '¡Enviado!',
            text: 'PDF enviado correctamente por correo.',
            confirmButtonText: 'OK',
            heightAuto: false
          });
        },
        error: async err => {
          console.error('Error al enviar PDF:', err);
          await loading.dismiss();
          await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo enviar el PDF por correo.',
            confirmButtonText: 'OK',
            heightAuto: false
          });
        }
      });
    } else {
      doc.save(nombreArchivo);
    }
  }

  private async exportarPDFGenerico<T>(
    datos: T[],
    nombreMascota: string,
    tituloBase: string,
    nombreArchivo: string,
    dibujarRegistro: (doc: jsPDF, registro: T, y: number, formatearFecha?: (fecha: any) => string) => number,
    formatearFecha?: (fecha: any) => string
  ) {
    if (!datos || datos.length === 0) {
      await Swal.fire({
        icon: 'info',
        title: 'Sin historial',
        text: `No hay registros para exportar.`,
        confirmButtonText: 'OK',
        heightAuto: false
      });
      return;
    }

    const doc = new jsPDF();
    const titulo = `${tituloBase} de ${nombreMascota || 'Mascota'}`;
    this.agregarEncabezado(doc, titulo);

    let y = 30;
    for (const registro of datos) {
      y = dibujarRegistro(doc, registro, y, formatearFecha);
      if (y > 270) {
        doc.addPage();
        this.agregarEncabezado(doc, titulo);
        y = 30;
      }
    }

    await this.procesarPDF(doc, nombreArchivo, titulo);
  }

  exportarHistorialMedico(registros: any[], nombreMascota: string, formatearFecha: (fecha: any) => string) {
    return this.exportarPDFGenerico(
      registros,
      nombreMascota,
      'Historial Médico',
      'historial_medico.pdf',
      (doc, r, y, ff) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(10, 45, 105);
        doc.text(`• Visita: ${ff ? ff(r.fechaVisita) : r.fechaVisita}`, 10, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        if (r.motivo)       doc.text(`Motivo: ${this.capitalize(r.motivo)}`, 15, y + 8);
        if (r.veterinario)  doc.text(`Veterinario: ${this.capitalize(r.veterinario)}`, 15, y + 15);
        if (r.diagnostico)  doc.text(`Diagnóstico: ${this.capitalize(r.diagnostico)}`, 15, y + 22);
        if (r.tratamiento)  doc.text(`Tratamiento: ${this.capitalize(r.tratamiento)}`, 15, y + 29);
        if (r.medicamentos) doc.text(`Medicamentos: ${this.capitalize(r.medicamentos)}`, 15, y + 36);
        if (r.notas)        doc.text(`Notas: ${this.capitalize(r.notas)}`, 15, y + 43);

        return y + 55;
      },
      formatearFecha
    );
  }

  exportarVacunas(vacunas: any[], nombreMascota: string, formatearFechaHora: (fecha: any) => string) {
    return this.exportarPDFGenerico(
      vacunas,
      nombreMascota,
      'Historial de Vacunas',
      'historial_vacunas.pdf',
      (doc, v, y, ff) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(10, 45, 105);
        doc.text(`• ${this.capitalize(v.nombre) || 'Vacuna sin nombre'}`, 10, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Fecha: ${ff ? ff(v.fechayhora) : v.fechayhora || 'N/A'}`, 15, y + 8);
        doc.text(`Estado: ${this.capitalize(v.estado) || 'Pendiente'}`, 15, y + 15);

        return y + 30;
      },
      formatearFechaHora
    );
  }

  exportarDesparasitaciones(desparasitaciones: any[], nombreMascota: string, formatearFechaHora: (fecha: any) => string) {
    return this.exportarPDFGenerico(
      desparasitaciones,
      nombreMascota,
      'Historial de Desparasitación',
      'historial_desparasitacion.pdf',
      (doc, d, y, ff) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(10, 45, 105);
        doc.text(`• ${this.capitalize(d.nombre) || 'Desparasitación sin nombre'}`, 10, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Fecha: ${ff ? ff(d.fechayhora) : d.fechayhora || 'N/A'}`, 15, y + 8);
        doc.text(`Estado: ${this.capitalize(d.estado) || 'Pendiente'}`, 15, y + 15);

        return y + 30;
      },
      formatearFechaHora
    );
  }

  exportarControles(controles: any[], nombreMascota: string, formatearFecha: (fecha: string) => string) {
    return this.exportarPDFGenerico(
      controles,
      nombreMascota,
      'Historial de Control de Peso y Crecimiento',
      'historial_controles.pdf',
      (doc, c, y, ff) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(10, 45, 105);
        doc.text(`• Registro`, 10, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Peso: ${c.peso ?? 'N/A'} ${this.capitalize(c.unidad) || 'kg'}`, 15, y + 8);
        doc.text(`Condición corporal: ${this.capitalize(c.condicionCorporal) || 'N/A'}`, 15, y + 15);
        doc.text(`Actividad física: ${this.capitalize(c.actividadFisica) || 'N/A'}`, 15, y + 22);
        doc.text(`Observaciones: ${this.capitalize(c.observaciones) || 'Ninguna'}`, 15, y + 29);
        doc.text(`Fecha: ${ff ? ff(c.fecha) : c.fecha || 'N/A'}`, 15, y + 36);

        return y + 50;
      },
      formatearFecha
    );
  }

  exportarAlimentacion(alimentaciones: any[], nombreMascota: string, formatearFechaHora: (fecha: any) => string) {
    return this.exportarPDFGenerico(
      alimentaciones,
      nombreMascota,
      'Historial de Alimentación',
      'historial_alimentacion.pdf',
      (doc, a, y, ff) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(10, 45, 105);
        doc.text(`• ${this.capitalize(a.tipoAlimento) || 'Tipo no especificado'} - ${this.capitalize(a.nombreAlimento) || 'Nombre no especificado'}`, 10, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Cantidad: ${a.cantidad || 'N/A'}`, 15, y + 8);
        doc.text(`Método: ${this.capitalize(a.metodo) || 'N/A'}`, 15, y + 15);
        doc.text(`¿Comió?: ${a.comio ? 'Sí' : 'No'}`, 15, y + 22);
        doc.text(`Fecha y hora: ${ff ? ff(a.fechayhora || a.fecha) : (a.fechayhora || a.fecha) || 'N/A'}`, 15, y + 29);
        doc.text(`Observaciones: ${this.capitalize(a.obsAdicionales) || 'Ninguna'}`, 15, y + 36);

        return y + 50;
      },
      formatearFechaHora
    );
  }
}
