import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CapitalizarPipe } from 'src/app/pipes/capitalizar.pipe';

@NgModule({
  declarations: [CapitalizarPipe],
  imports: [CommonModule],
  exports: [CapitalizarPipe, CommonModule] 
})
export class SharedModule {}
