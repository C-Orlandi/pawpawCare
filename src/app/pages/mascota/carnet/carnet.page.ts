  import { Component, OnInit } from '@angular/core';
  import jsPDF from 'jspdf';
  import html2canvas from 'html2canvas';
  import Swal from 'sweetalert2';
  import { environment } from 'src/environments/environment';
  import { HttpClient } from '@angular/common/http';
  import { LoadingController, NavController } from '@ionic/angular';
  import { AngularFirestore } from '@angular/fire/compat/firestore';

  @Component({
    selector: 'app-carnet',
    templateUrl: './carnet.page.html',
    styleUrls: ['./carnet.page.scss']
  })
  export class CarnetPage implements OnInit {
    
    mascota: any;
    imagenFile: File | null = null;
    imagenPreview: string | null = null;

    constructor(private http: HttpClient, private loadingController: LoadingController, private navCtrl: NavController, private firestore: AngularFirestore) {}
    
    async ngOnInit() {
      const data = localStorage.getItem('mascotaSeleccionada');
    if (data) {
      // ✅ Clonamos el objeto para que los cambios no afecten a localStorage
      const originalMascota = JSON.parse(data);
      this.mascota = JSON.parse(JSON.stringify(originalMascota));  // clon profundo

      if (this.mascota.imagenPath) {
        const base64 = await this.loadImageViaDOM();
        if (base64) {
          this.mascota.imagenBase64 = base64;
        } else {
          this.mascota.imagenBase64 = 'assets/mascotas/default.jpg';
        }
      } else {
        this.mascota.imagenBase64 = 'assets/mascotas/default.jpg';
      }
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
        const alto = doc.internal.pageSize.getHeight();

        // 🟦 Configuración del carnet tipo tarjeta
        const margenHorizontal = 20;
        const carnetWidth = ancho - margenHorizontal * 2;
        const carnetHeight = 160;
        const xCarnet = margenHorizontal;
        const yCarnet = 40;

        // Fondo pastel moderno
        doc.setFillColor(245, 250, 255); // azul muy claro
        doc.roundedRect(xCarnet, yCarnet, carnetWidth, carnetHeight, 6, 6, 'F');

        // Borde gris claro
        doc.setDrawColor(220, 220, 220);
        doc.roundedRect(xCarnet, yCarnet, carnetWidth, carnetHeight, 6, 6);

        // 🐾 Imagen circular centrada
        const imgBase64 = await this.loadImageViaDOM();
        if (imgBase64) {
          const imgSize = 55;
          const xImg = ancho / 2 - imgSize / 2;
          const yImg = yCarnet + 10;

          // Círculo blanco de fondo (simulación de borde circular)
          doc.setFillColor(255, 255, 255);
          doc.circle(ancho / 2, yImg + imgSize / 2, imgSize / 2 + 2, 'F');

          doc.addImage(imgBase64, 'JPEG', xImg, yImg, imgSize, imgSize, undefined, 'FAST');
        }

        // 🐶 Nombre destacado
        let yTexto = yCarnet + 75;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 60);
        doc.text(this.mascota?.nombre || 'Nombre no disponible', ancho / 2, yTexto, { align: 'center' });

        // 🐕 Especie - Raza
        yTexto += 9;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(
          `${this.mascota?.tipo || 'Desconocido'} - ${this.mascota?.raza || 'Sin raza'}`,
          ancho / 2,
          yTexto,
          { align: 'center' }
        );

        // 🧾 Información detallada
        yTexto += 15;
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);

        const datos = [
          ['Sexo', this.mascota?.sexo || 'Desconocido'],
          ['Color', this.mascota?.color || 'No especificado'],
          ['N° Chip', this.mascota?.chip || 'No registrado'],
          ['Dueño', this.mascota?.dueno?.nombre || 'No asignado'],
          ['Contacto', this.mascota?.dueno?.contacto || 'Sin contacto']
        ];

        for (const [label, valor] of datos) {
          doc.text(`${label}: ${valor}`, ancho / 2, yTexto, { align: 'center' });
          yTexto += 8;
        }

        // 🌐 Branding inferior
        doc.setFontSize(10);
        doc.setTextColor(180, 180, 180);
        doc.text('PawCare - Gestión de Salud Animal', ancho / 2, yCarnet + carnetHeight - 10, { align: 'center' });

        // 📤 Generar PDF y enviar por correo
        const pdfOutput = doc.output('datauristring');
        const base64Data = pdfOutput.split(',')[1];
        const nombreArchivo = `carnet_${this.mascota?.nombre || 'mascota'}.pdf`;

        const usuarioRaw = localStorage.getItem('usuarioLogin');
        const email = usuarioRaw ? JSON.parse(usuarioRaw).email : null;

        if (!email) {
          await loading.dismiss();
          await Swal.fire({
            icon: 'error',
            title: 'Correo no encontrado',
            text: 'No se encontró el email del usuario.',
            confirmButtonText: 'OK',
            heightAuto: false
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
            await Swal.fire({
              icon: 'success',
              title: '¡Carnet enviado!',
              text: 'El carnet fue enviado correctamente por correo.',
              confirmButtonText: 'OK',
              heightAuto: false
            });
          },
          error: async err => {
            console.error('Error al enviar carnet:', err);
            await loading.dismiss();
            await Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo enviar el carnet por correo.',
              confirmButtonText: 'OK',
              heightAuto: false
            });
          }
        });

      } catch (err) {
        console.error('Error generando PDF:', err);
        await loading.dismiss();
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo generar el PDF del carnet.',
          confirmButtonText: 'OK',
          heightAuto: false
        });
      }
    }

    private async loadImageViaDOM(): Promise<string | null> {
      try {
        const imagePath = this.mascota?.imagenPath || 'mascotas/default.jpg';

        const response = await this.http
          .get<{ base64: string }>(`${environment.backendUrl}/imagen-firebase?path=${encodeURIComponent(imagePath)}`)
          .toPromise();

        return response?.base64 || null;
      } catch (err) {
        console.error('❌ Error cargando imagen desde backend por path:', err);
        return null;
      }
    }

    onFileSelected(event: any) {
      const file = event.target.files[0];
      if (file) {
        this.imagenFile = file;
        const reader = new FileReader();
        reader.onload = e => this.imagenPreview = (e.target as any).result;
        reader.readAsDataURL(file);
      }
    }

    async guardarNuevaFoto() {
    if (!this.imagenFile) {
      await Swal.fire({
        icon: 'warning',
        title: 'Selecciona una imagen',
        text: 'Por favor, elige primero una foto.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
      return;
    }

    const loading = await this.loadingController.create({ message: 'Subiendo foto...' });
    await loading.present();

    try {
      const formData = new FormData();
      formData.append('foto', this.imagenFile);

      const res: any = await this.http
        .post(`${environment.backendUrl.replace('/api','')}/upload`, formData)
        .toPromise();

      // ✅ Actualiza Firestore
      await this.firestore.collection('mascotas').doc(this.mascota.mid).update({
        imagenCarnet: res.url,
        imagenPath: res.path
      });

      // ✅ Vuelve a obtener la mascota actualizada
      const docSnap = await this.firestore
        .collection('mascotas')
        .doc(this.mascota.mid)
        .get()
        .toPromise();
      const datosActualizados = docSnap?.data();

      if (datosActualizados) {
        this.mascota = { ...this.mascota, ...datosActualizados };
        // ✅ Carga la nueva imagen como base64
        const nuevaBase64 = await this.loadImageViaDOM();
        this.mascota.imagenBase64 = nuevaBase64 || 'assets/mascotas/default.jpg';
      }

      this.imagenFile = null;
      this.imagenPreview = null;

      await loading.dismiss();
      await Swal.fire({
        icon: 'success',
        title: '¡Foto actualizada!',
        text: 'La foto fue subida y guardada correctamente.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
    } catch (e) {
      await loading.dismiss();
      await Swal.fire({
        icon: 'error',
        title: 'Error al subir foto',
        text: 'Ocurrió un problema al subir la imagen.',
        confirmButtonText: 'OK',
        heightAuto: false
      });
    }
  }

    goBack() {
    this.navCtrl.back();
    }

  }







