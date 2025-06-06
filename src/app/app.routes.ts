
import { Routes } from '@angular/router';
import { CreacuenComponent } from './creacuen/creacuen.component';
import { RegistroComponent } from './registro/registro.component';
import { CalendarComponent } from './calendar/calendar.component'; 
export const routes: Routes = [
  { path: '', redirectTo: 'registro', pathMatch: 'full' }, 


  { path: 'registro', component: RegistroComponent },


  { path: 'crear-cuenta', component: CreacuenComponent },

  { path: 'calendar', component: CalendarComponent }, 
  
];