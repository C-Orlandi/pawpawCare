export interface Mascota {
  mid?: string;
  usuarioUid: string;
  nombre: string;
  tipo: string;
  raza: string;
  sexo: string;          
  fechaNacimiento: string; 
  color: string;          
  chip: string;          
  peso: number | string; 
  categoria: string;      
  tieneVacunas?: boolean;
  dueno?: {
    nombre: string;
    contacto: string;
  };
}
