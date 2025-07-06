// tema.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TemaService {
  private colorToolbarSubject = new BehaviorSubject<string>('toolbar-morado');
  colorToolbar$ = this.colorToolbarSubject.asObservable();

  setColor(color: string) {
    this.clearColor(); 
    document.body.classList.add(color);
    this.colorToolbarSubject.next(color);
    localStorage.setItem('toolbarColor', color);
  }

  getColorFromStorage(): string {
    return localStorage.getItem('toolbarColor') || 'toolbar-morado';
  }

  clearColor() {
    const classes = Array.from(document.body.classList);
    classes.forEach(c => {
      if (c.startsWith('toolbar-')) {
        document.body.classList.remove(c);
      }
    });
  }
}
