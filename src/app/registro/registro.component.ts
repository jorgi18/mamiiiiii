import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Podrías necesitar CommonModule si usas directivas como *ngIf, *ngFor
import { RouterLink } from '@angular/router'; // Asegúrate de importar RouterLink si lo usas en el HTML del componente

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, RouterLink], // Asegúrate de incluir RouterLink aquí
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  title: string = 'Registro de Usuario'; // Un título más apropiado para este componente

  registrar() {
    const codigo = (document.getElementById('codigo') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;

    if (codigo && password) {
      const mensaje = document.getElementById('mensaje');
      if (mensaje) mensaje.innerText = '¡Registro exitoso!';
    } else {
      const mensaje = document.getElementById('mensaje');
      if (mensaje) mensaje.innerText = 'Por favor, completa todos los campos.';
    }
  }
}