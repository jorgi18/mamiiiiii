import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; 

import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth'; 
import { Firestore, doc, setDoc } from '@angular/fire/firestore'; 

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule 
  ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  title: string = 'Registro de Usuario';
  mensaje: string = '';
  
  emailRegistro: string = '';
  passwordRegistro: string = '';
  nombreUsuario: string = ''; 

  constructor(
    private auth: Auth,
    private router: Router,
    private firestore: Firestore 
  ) {}

  async registrar() {
    
    if (!this.emailRegistro || !this.passwordRegistro || !this.nombreUsuario) {
      this.mensaje = 'Por favor, completa todos los campos.';
      return;
    }

    try {
      
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.emailRegistro, this.passwordRegistro);
      const user = userCredential.user; 

      await setDoc(doc(this.firestore, 'usuarios', user.uid), {
        email: user.email,
        nombre: this.nombreUsuario,
        fechaRegistro: new Date() 
      });

      console.log('Usuario registrado con éxito en Authentication y datos guardados en Firestore:', user);
      this.mensaje = '¡Registro exitoso! Redirigiendo a inicio de sesión...';

      this.router.navigate(['/crear-cuenta']);

    } catch (error: any) {
      console.error('Error al registrar usuario:', error);
      if (error.code === 'auth/email-already-in-use') {
        this.mensaje = 'Este correo electrónico ya está registrado.';
      } else if (error.code === 'auth/weak-password') {
        this.mensaje = 'La contraseña debe tener al menos 6 caracteres.';
      } else {
        this.mensaje = `Error al registrar: ${error.message}`;
      }
    }
  }
}