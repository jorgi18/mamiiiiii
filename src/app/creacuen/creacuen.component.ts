
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterLink, Router } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; 

import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-creacuen',
  standalone: true, 
  imports: [
    CommonModule,   
    RouterLink,     
    FormsModule     
  ],
  templateUrl: './creacuen.component.html',
  styleUrl: './creacuen.component.css'
})
export class CreacuenComponent {
  title: string = 'Inicio de Sesión'; 
  mensaje: string = ''; 
  
  emailLogin: string = '';
  passwordLogin: string = '';

  
  constructor(
    private auth: Auth,   
    private router: Router 
  ) {}

  
  async iniciarSesion() {
    
    if (!this.emailLogin || !this.passwordLogin) {
      this.mensaje = 'Por favor, introduce tu correo y contraseña.';
      return; 
    }

    try {
      
      const userCredential = await signInWithEmailAndPassword(this.auth, this.emailLogin, this.passwordLogin);
      console.log('Inicio de sesión exitoso! Usuario:', userCredential.user);
      this.mensaje = '¡Inicio de sesión exitoso! Redirigiendo...';

      this.router.navigate(['/calendar']); 

    } catch (error: any) {
     
      console.error('Error al iniciar sesión:', error); 

      if (error.code === 'auth/invalid-email') {
        this.mensaje = 'Formato de correo electrónico no válido.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        this.mensaje = 'Correo o contraseña incorrectos.'; 
      } else if (error.code === 'auth/user-disabled') {
        this.mensaje = 'Tu cuenta ha sido deshabilitada.';
      } else {
        
        this.mensaje = `Error al iniciar sesión: ${error.message}`;
      }
    }
  }
}