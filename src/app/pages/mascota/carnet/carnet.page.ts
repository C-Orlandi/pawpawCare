import { Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-carnet',
  templateUrl: './carnet.page.html',
  styleUrls: ['./carnet.page.scss']
})
export class CarnetPage implements OnInit {
  
  mascota: any;

  constructor(private http: HttpClient, private loadingController: LoadingController) {}
  
  ngOnInit() {
    const data = localStorage.getItem('mascotaSeleccionada');
    if (data) {
      this.mascota = JSON.parse(data);
    }
  }
  
  async exportarCarnet() {
    const loading = await this.loadingController.create({
      message: 'Generando carnet...',
      spinner: 'circles'
    });
    await loading.present();

    try {
      const doc = new jsPDF('p', 'mm', 'a4');

      const ancho = doc.internal.pageSize.getWidth();
      let y = 20;

      // 1. Agrega título
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('Carnet Digital de Mascota', ancho / 2, y, { align: 'center' });
      y += 10;

      const imgBase64 = await this.loadImageViaDOM();

      if (imgBase64) {
        doc.addImage(imgBase64, 'JPEG', (ancho - 50) / 2, y, 50, 50);
        y += 60;
      } else {
        console.warn('No se pudo cargar la imagen de la mascota, se omitirá en el PDF.');
      }

      // 3. Agrega datos
      doc.setFontSize(12);
      const datos = [
        ['Nombre', this.mascota?.nombre],
        ['Especie', this.mascota?.tipo],
        ['Raza', this.mascota?.raza],
        ['Sexo', this.mascota?.sexo],
        ['Color', this.mascota?.color],
        ['N° Chip', this.mascota?.chip || 'No registrado'],
        ['Dueño', this.mascota?.dueno?.nombre || 'No asignado'],
        ['Contacto', this.mascota?.dueno?.contacto || 'Sin contacto'],
      ];

      for (const [etiqueta, valor] of datos) {
        doc.setFont('helvetica', 'bold');
        doc.text(`${etiqueta}:`, 30, y);
        doc.setFont('helvetica', 'normal');
        doc.text(valor || 'N/A', 70, y);
        y += 10;
      }

      const pdfOutput = doc.output('datauristring');
      const base64Data = pdfOutput.split(',')[1];
      const nombreArchivo = `carnet_${this.mascota?.nombre || 'mascota'}.pdf`;

      // 4. Enviar por correo
      const usuarioRaw = localStorage.getItem('usuarioLogin');
      const email = usuarioRaw ? JSON.parse(usuarioRaw).email : null;

      if (!email) {
        await loading.dismiss();
        await Swal.fire({
          icon: 'error',
          title: 'Correo no encontrado',
          text: 'No se encontró el email del usuario.',
          confirmButtonText: 'OK'
        });
        return;
      }

      const payload = {
        email,
        asunto: `Carnet de ${this.mascota?.nombre}`,
        nombreArchivo,
        pdfBase64: base64Data
      };

      this.http.post(`${environment.backendUrl}/enviar-pdf`, payload).subscribe({
        next: async () => {
          await loading.dismiss();
          Swal.fire({
            icon: 'success',
            title: '¡Carnet enviado!',
            text: '📧 El carnet fue enviado correctamente por correo.',
            confirmButtonText: 'OK'
          });
        },
        error: async err => {
          console.error('❌ Error al enviar carnet:', err);
          await loading.dismiss();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo enviar el carnet por correo.',
            confirmButtonText: 'OK'
          });
        }
      });

    } catch (err) {
      console.error('Error generando PDF:', err);
      await loading.dismiss();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo generar el PDF del carnet.',
        confirmButtonText: 'OK'
      });
    }
  }

  private async loadImageAsBlob(url: string): Promise<Blob> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('❌ Error HTTP al cargar imagen:', response.status, response.statusText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.blob();
  } catch (error) {
    console.error('❌ Error cargando imagen desde Firebase Storage con fetch:', error);
    throw error;
  }
}

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(blob);
    }); 
  }

  private async loadImageViaDOM(): Promise<string | null> {
    try {
      const imagePath = this.mascota?.imagenPath || 'mascotas/default.jpg';

      const response = await this.http
        .get<{ base64: string }>(`${environment.backendUrl}/api/imagen-firebase?path=${encodeURIComponent(imagePath)}`)
        .toPromise();

      return response?.base64 || null;
    } catch (err) {
      console.error('❌ Error cargando imagen desde backend por path:', err);
      return null;
    }
  }

}







