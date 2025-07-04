

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';


import { environment } from '../environments/environment'; 


import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore'; 

import { routes } from './app.routes'; 

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    
   
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    
    
    provideAuth(() => getAuth()),
    
    
    provideFirestore(() => getFirestore()), 
  ]
};