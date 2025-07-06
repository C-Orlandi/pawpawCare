  import { Component, OnInit } from '@angular/core';
  import { FormBuilder, FormGroup, Validators } from '@angular/forms';
  import { LoadingController, MenuController } from '@ionic/angular';
  import Swal from 'sweetalert2';
  import { ActivatedRoute, Router } from '@angular/router';
  import { AngularFirestore } from '@angular/fire/compat/firestore';
  import { HttpClient, HttpClientModule } from '@angular/common/http';
  import { v4 as uuidv4 } from 'uuid';
import { environment } from 'src/environments/environment';

  @Component({
    selector: 'app-registro-mascota',
    templateUrl: './registro-mascota.page.html',
    styleUrls: ['./registro-mascota.page.scss']
  })
  export class RegistroMascotaPage implements OnInit {
    mascotaForm: FormGroup;
    usuarioLogin?: any;
    imagenFile: File | null = null;
    imagenPreview: string | null = null;
    modoEdicion: boolean = false;
    midExistente: string | null = null;
    imagenAnterior: string | null = null;

    constructor(
      private fb: FormBuilder,
      private loadingController: LoadingController,
      private firestore: AngularFirestore,
      private router: Router,
      private menuController: MenuController,
      private http: HttpClient,
      private route: ActivatedRoute
    ) {
      this.mascotaForm = this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)]],
        tipo: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)]],
        raza: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)]],
        sexo: ['', Validators.required],
        fechaNacimiento: ['', Validators.required],
        color: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/)]],
        chip: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
        peso: ['', Validators.pattern(/^[0-9]+(\.[0-9]+)?$/)], // opcional, acepta decimales
        categoria: ['', Validators.required],
        tieneVacunas: [false]
      });
    }

    ngOnInit() {
      this.menuController.enable(true);
      const usuario = localStorage.getItem('usuarioLogin');
      if (usuario) {
        this.usuarioLogin = JSON.parse(usuario);
      }
    }

    ionViewWillEnter() {
      const modo = this.route.snapshot.queryParamMap.get('modo');
      if (modo === 'editar') {
        this.modoEdicion = true;
        const mascota = localStorage.getItem('mascotaSeleccionada');
        if (mascota) {
          const mascotaData = JSON.parse(mascota);
          this.midExistente = mascotaData.mid || null;
          this.imagenAnterior = mascotaData.imagen || null;

          this.mascotaForm.patchValue({
            nombre: mascotaData.nombre || '',
            tipo: mascotaData.tipo || '',
            raza: mascotaData.raza || '',
            sexo: mascotaData.sexo || '',
            fechaNacimiento: mascotaData.fechaNacimiento || '',
            color: mascotaData.color || '',
            chip: mascotaData.chip || '',
            peso: mascotaData.peso || '',
            categoria: mascotaData.categoria || '',
            tieneVacunas: mascotaData.tieneVacunas || false
          });

          if (mascotaData.imagen) {
            this.imagenPreview = mascotaData.imagen;
          }
        }
      }
    }

    onCategoriaChange() {
      const categoria = this.mascotaForm.get('categoria')?.value;
      if (categoria !== 'exotico') {
        this.mascotaForm.patchValue({ tieneVacunas: false });
      }
    }

    seleccionarImagen(event: any) {
      const file = event.target.files[0];
      if (file) {
        this.imagenFile = file;
      }
    }

    calcularEdad(fechaNacimiento: string): number {
      const hoy = new Date();
      const nacimiento = new Date(fechaNacimiento);
      let edad = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
      }
      return edad;
    }

    async guardarMascota() {
      if (this.mascotaForm.invalid) {
        Swal.fire({
          icon: 'warning',
          title: 'Formulario inválido',
          text: 'Por favor completa todos los campos correctamente.',
          confirmButtonText: 'OK',
          heightAuto: false
        });
        return;
      }

      const loading = await this.loadingController.create({
        message: this.modoEdicion ? 'Actualizando mascota...' : 'Guardando mascota...'
      });
      await loading.present();

      try {
        const data = this.mascotaForm.value;
        const edadCalculada = this.calcularEdad(data.fechaNacimiento);

        const mid = this.modoEdicion && this.midExistente ? this.midExistente : uuidv4();

        let urlImagen = this.imagenAnterior || '';
        let imagenPath = this.mascotaForm.value.imagenPath || '';
        if (this.imagenFile) {
          const formData = new FormData();
          formData.append('foto', this.imagenFile);
          const uploadResponse: any = await this.http.post(`${environment.backendUrl.replace('/api', '')}/upload`, formData).toPromise();

          urlImagen = uploadResponse.url;
          imagenPath = uploadResponse.path; 
        }


        // Obtener usuario actualizado desde Firestore
        const usuarioDoc = await this.firestore.doc<{ nombre?: string; contacto?: string }>(`usuarios/${this.usuarioLogin?.uid}`).get().toPromise();
        const usuarioData = usuarioDoc?.data() || {};

        const duenoNombre = usuarioData.nombre || 'No registrado';
        const duenoContacto = usuarioData.contacto || 'No registrado';

        const mascotaData = {
          mid,
          ...data,
          edad: edadCalculada,
          imagen: urlImagen,
          imagenPath,
          usuarioUid: this.usuarioLogin?.uid || 'desconocido',
          dueno: {
            nombre: duenoNombre,
            contacto: duenoContacto
          }
        };

        await this.firestore.collection('mascotas').doc(mid).set(mascotaData);
        await loading.dismiss();

        localStorage.setItem('mascotaSeleccionada', JSON.stringify(mascotaData));

        Swal.fire({
          icon: 'success',
          title: this.modoEdicion ? 'Actualización Exitosa' : 'Registro Exitoso',
          text: this.modoEdicion
            ? 'La información de la mascota fue actualizada correctamente.'
            : 'Mascota registrada correctamente.',
          confirmButtonText: 'OK',
          heightAuto: false
        }).then(() => {
          this.router.navigate(['/mis-mascotas']);
        });

      } catch (error) {
        console.error('Error al guardar la mascota:', error);
        await loading.dismiss();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error al guardar la mascota.',
          confirmButtonText: 'OK',
          heightAuto: false
        });
      }
    }

    cerrar() {
    this.router.navigate(['/mis-mascotas']);
  }
  }