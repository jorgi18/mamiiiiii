// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { CreacuenComponent } from './creacuen/creacuen.component';
import { RegistroComponent } from './registro/registro.component'; // ¡Importa el nuevo componente de registro!

export const routes: Routes = [
  // Ruta por defecto: Redirige de la raíz ('') a '/registro' si quieres que el registro sea la primera página
  { path: '', redirectTo: 'registro', pathMatch: 'full' },

  // Ruta para el formulario de Registro
  { path: 'registro', component: RegistroComponent },

  // Ruta para el formulario de Inicio de Sesión
  { path: 'crear-cuenta', component: CreacuenComponent },

  // Opcional: Ruta para manejar URLs no encontradas
  // { path: '**', component: NotFoundComponent }
];