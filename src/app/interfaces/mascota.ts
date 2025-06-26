export interface Mascota {
  mid: string;
  usuarioUid: string;
  nombre: string;
  tipo: string;
  raza?: string;
  fechaNacimiento: string;
  edad?: string;
  peso?: string;
  dueno: {
    nombre: string;
    contacto: string;
  };
}
