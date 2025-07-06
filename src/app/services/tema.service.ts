// tema.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TemaService {
  private colorToolbarSubject = new BehaviorSubject<string>(this.getColorFromStorage());
  colorToolbar$ = this.colorToolbarSubject.asObservable();

  constructor() {
    // Aplica inmediatamente el color al body si existe al iniciar
    const saved = this.getColorFromStorage();
    if (saved) {
      document.body.classList.add(saved);
    }
  }

  setColor(color: string) {
    // Elimina clases anteriores
    document.body.classList.forEach(c => {
      if (c.startsWith('toolbar-')) {
        document.body.classList.remove(c);
      }
    });

    // Aplica nueva clase
    document.body.classList.add(color);
    localStorage.setItem('toolbarColor', color); // Opcional
    this.colorToolbarSubject.next(color);
  }

  getColorFromStorage(): string {
    return localStorage.getItem('toolbarColor') || 'toolbar-morado';
  }
}
