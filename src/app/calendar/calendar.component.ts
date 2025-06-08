import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router'; 

import { Auth, user, User } from '@angular/fire/auth';
import { Firestore, collection, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';

import { Subscription } from 'rxjs';
export interface CalendarDay {
  day: number | string;
  value?: number | null; 
  isWeekday?: boolean; 
}
interface UserDayData {
  value: number; 
  date: string; 
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule 
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit, OnDestroy {


  sidebarOpen: boolean = false;
  userPopupOpen: boolean = false;


  counting: boolean = false;
  counter: number = 0;
  intervalId: any = null;


  months: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  currentMonthIndex: number;
  monthTitle: string = '';
  calendarDays: CalendarDay[] = [];
  selectedDayInput: number | null = null;

  currentUser: User | null = null;
  userSubscription: Subscription | undefined;


  constructor(
    private auth: Auth, 
    private firestore: Firestore,
    private router: Router
  ) {
    this.currentMonthIndex = new Date().getMonth();
  }

  ngOnInit(): void {
    this.userSubscription = user(this.auth).subscribe(firebaseUser => {
      this.currentUser = firebaseUser;
      if (this.currentUser) {
        this.renderCalendar(this.currentMonthIndex);
        this.loadUserDayData();
      } else {
        this.calendarDays = [];
        this.monthTitle = 'Inicia sesión';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }



  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleUserPopup() {
    this.userPopupOpen = !this.userPopupOpen;
  }
  
  changeMonth(monthIndex: number) {
    this.currentMonthIndex = monthIndex;
    this.renderCalendar(monthIndex);
    this.toggleSidebar();
    if (this.currentUser) {
        this.loadUserDayData();
    }
  }

  
  logoutAndNavigate() {
    this.auth.signOut()
      .then(() => {
        console.log('Usuario ha cerrado sesión.');
        this.router.navigate(['/creacuen']); 
      })
      .catch(error => {
        console.error('Error al cerrar sesión:', error);
        this.router.navigate(['/creacuen']);
      });
  }

  renderCalendar(monthIndex: number) {
    const now = new Date();
    const year = now.getFullYear();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, monthIndex, 1).getDay();

    this.monthTitle = this.months[monthIndex];
    this.calendarDays = [];

    const weekdays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    weekdays.forEach(wDay => {
        this.calendarDays.push({ day: wDay, isWeekday: true });
    });

    for (let i = 0; i < firstDayOfWeek; i++) {
      this.calendarDays.push({ day: '' });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      this.calendarDays.push({ day: d, value: null });
    }
  }

  toggleCounter() {
    if (!this.counting) {
      this.counting = true;
      this.intervalId = setInterval(() => {
        this.counter++;
      }, 1000);
    } else {
      this.counting = false;
      clearInterval(this.intervalId);

      if (this.selectedDayInput !== null && !isNaN(this.selectedDayInput)) {
        this.insertValueInDayAndSave(this.selectedDayInput, this.counter);
      }
      this.counter = 0;
    }
  }

  async insertValueInDayAndSave(dayToUpdate: number, value: number) {
    const foundDay = this.calendarDays.find(
      cell => typeof cell.day === 'number' && cell.day === dayToUpdate
    );

    if (foundDay) {
      foundDay.value = value;
    }

    if (this.currentUser && this.currentUser.uid) {
      const year = new Date().getFullYear();
      const dateKey = `${year}-${(this.currentMonthIndex + 1).toString().padStart(2, '0')}-${dayToUpdate.toString().padStart(2, '0')}`;
      const userDocRef = doc(this.firestore, 'users', this.currentUser.uid);

      try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          await updateDoc(userDocRef, {
            [`dayData.${dateKey}`]: { value: value, timestamp: new Date().toISOString() }
          });
        } else {
          await setDoc(userDocRef, {
            dayData: {
              [dateKey]: { value: value, timestamp: new Date().toISOString() }
            }
          });
        }
        console.log(`Dato para ${dateKey} guardado con éxito para el usuario ${this.currentUser.uid}`);
      } catch (error) {
        console.error('Error al guardar el dato en Firestore:', error);
      }
    } else {
      console.warn('No hay usuario logueado para guardar datos.');
    }
  }

  async loadUserDayData() {
    if (this.currentUser && this.currentUser.uid) {
      const userDocRef = doc(this.firestore, 'users', this.currentUser.uid);
      try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const dayData = userData['dayData'] || {};
          const year = new Date().getFullYear();
          const currentMonthPadded = (this.currentMonthIndex + 1).toString().padStart(2, '0');

          this.calendarDays.forEach(dayCell => {
            if (typeof dayCell.day === 'number') {
              const dateKey = `${year}-${currentMonthPadded}-${dayCell.day.toString().padStart(2, '0')}`;
              if (dayData[dateKey]) {
                dayCell.value = dayData[dateKey].value;
              } else {
                dayCell.value = null;
              }
            }
          });
          console.log('Datos de días cargados con éxito para el usuario:', this.currentUser.uid);
        } else {
          console.log('No existen datos de calendario para este usuario.');
          this.calendarDays.forEach(dayCell => {
              if (typeof dayCell.day === 'number') {
                  dayCell.value = null;
              }
          });
        }
      } catch (error) {
        console.error('Error al cargar datos de Firestore:', error);
      }
    }
  }
}