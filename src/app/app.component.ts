import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router'; // Asegúrate de que RouterModule y RouterOutlet estén aquí

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, RouterOutlet], // Importa RouterModule para los routerLink y RouterOutlet para el <router-outlet>
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title: string = 'Mi Aplicación'; // Título general de la aplicación
  // El método 'registrar()' YA NO DEBE ESTAR AQUÍ, ahora está en RegistroComponent
}