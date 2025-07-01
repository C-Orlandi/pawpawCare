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
  const carnetElement = document.getElementById('carnetPDF');
  if (!carnetElement) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo generar el carnet.',
      confirmButtonText: 'OK',
      heightAuto: false,
    });
    return;
  }

  const canvas = await html2canvas(carnetElement, {
    useCORS: true,
    scale: 1
  });
  const imgData = canvas.toDataURL('image/jpeg', 1.0);

  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, 'JPEG', 0, 10, pdfWidth, pdfHeight);

  const nombreArchivo = `carnet_${this.mascota?.nombre || 'mascota'}.pdf`;
  const pdfOutput = pdf.output('datauristring');
  const base64Data = pdfOutput.split(',')[1];

  const usuarioRaw = localStorage.getItem('usuarioLogin');
  const email = usuarioRaw ? JSON.parse(usuarioRaw).email : null;

  if (!email) {
    Swal.fire({
      icon: 'error',
      title: 'Usuario no válido',
      text: 'No se encontró el correo electrónico del usuario.',
      confirmButtonText: 'OK',
      heightAuto: false
    });
    return;
  }

  const payload = {
    email,
    asunto: `Carnet de ${this.mascota?.nombre || 'Mascota'}`,
    nombreArchivo,
    pdfBase64: base64Data,
  };

  const loading = await this.loadingController.create({
    message: 'Enviando carnet...',
    spinner: 'circles'
  });
  await loading.present();

  this.http.post(`${environment.backendUrl}/enviar-pdf`, payload).subscribe({
    next: async () => {
      await loading.dismiss();
      Swal.fire({
        icon: 'success',
        title: '¡Carnet enviado!',
        text: '📧 El carnet fue enviado correctamente por correo.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
    },
    error: async err => {
      console.error('❌ Error al enviar carnet:', err);
      await loading.dismiss();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo enviar el carnet por correo.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
    }
  });
}
}




