export interface Mascota {
  mid?: string;
  usuarioUid: string;
  nombre: string;
  tipo: string;
  raza: string;
  sexo: string;           // Agregar esta línea
  fechaNacimiento: string; // o Date, según uses
  color: string;          // Agregar esta línea
  chip: string;           // Agregar esta línea
  peso: number | string;  // según tengas definido
  categoria: string;      // Agregar esta línea
  tieneVacunas?: boolean;
  dueno?: {
    nombre: string;
    contacto: string;
  };
}
