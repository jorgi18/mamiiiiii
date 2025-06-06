// src/app/calendar/calendar.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para *ngIf, *ngFor, [ngClass]
import { FormsModule } from '@angular/forms'; // Necesario para [(ngModel)]

// Importaciones de Firebase
import { Auth, user, User } from '@angular/fire/auth'; // user para observar el estado del usuario
import { Firestore, collection, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore'; // Para Firestore

import { Subscription } from 'rxjs'; // Necesario para 'Subscription'

// Interfaz para definir la estructura de cada día en el calendario
export interface CalendarDay {
  day: number | string; // El número del día (1-31) o el nombre del día de la semana (D, L, M, etc.)
  value?: number | null; // El valor del contador, si se le asigna uno a este día
  isWeekday?: boolean; // Para identificar si es un nombre de día de la semana
}

// Interfaz para guardar los datos específicos de un día en Firestore (aunque no se usa directamente para el mapa en Firestore)
interface UserDayData {
  value: number; // El valor del contador
  date: string; // La fecha en formato YYYY-MM-DD
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule // Importa FormsModule para usar [(ngModel)]
  ],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit, OnDestroy {

  // Propiedades para controlar la visibilidad de elementos
  sidebarOpen: boolean = false;
  userPopupOpen: boolean = false;

  // Propiedades para la funcionalidad del contador
  counting: boolean = false;
  counter: number = 0;
  intervalId: any = null; // Para guardar el ID del setInterval y poder limpiarlo

  // Propiedades para la lógica del calendario
  months: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  currentMonthIndex: number; // Índice del mes actual mostrado (0-11)
  monthTitle: string = ''; // Título del mes que se muestra en el calendario
  calendarDays: CalendarDay[] = []; // Array de objetos CalendarDay para los días del calendario
  selectedDayInput: number | null = null; // Valor del input en el popup de usuario para el día

  currentUser: User | null = null; // Para almacenar el objeto de usuario actual
  userSubscription: Subscription | undefined; // Propiedad de suscripción, inicializada para evitar error

  // Inyecta Auth y Firestore en el constructor
  constructor(private auth: Auth, private firestore: Firestore) {
    this.currentMonthIndex = new Date().getMonth();
  }

  // Método que se ejecuta cuando el componente se inicializa
  ngOnInit(): void {
    // Suscribirse al estado del usuario
    this.userSubscription = user(this.auth).subscribe(firebaseUser => {
      this.currentUser = firebaseUser;
      if (this.currentUser) {
        // Cargar los datos del calendario para el usuario logueado
        this.renderCalendar(this.currentMonthIndex);
        this.loadUserDayData();
      } else {
        // Si no hay usuario, resetear el calendario o mostrar un mensaje
        this.calendarDays = [];
        this.monthTitle = 'Inicia sesión';
      }
    });
  }

  // Método que se ejecuta cuando el componente es destruido
  ngOnDestroy(): void {
    // Limpia el intervalo del contador para evitar fugas de memoria
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    // Desuscribirse para evitar fugas de memoria
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  // --- Métodos de interacción del usuario ---

  /**
   * Alterna la visibilidad de la barra lateral (sidebar).
   */
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  /**
   * Alterna la visibilidad del popup de información del usuario.
   */
  toggleUserPopup() {
    this.userPopupOpen = !this.userPopupOpen;
  }

  /**
   * Cambia el mes mostrado en el calendario y lo renderiza de nuevo.
   * @param monthIndex El índice del mes a mostrar (0 para Enero, 11 para Diciembre).
   */
  changeMonth(monthIndex: number) {
    this.currentMonthIndex = monthIndex; // Actualiza el índice del mes
    this.renderCalendar(monthIndex); // Vuelve a renderizar el calendario con el nuevo mes
    this.toggleSidebar(); // Cierra la barra lateral después de seleccionar un mes
    // Vuelve a cargar datos específicos para el nuevo mes si hay un usuario logueado
    if (this.currentUser) {
        this.loadUserDayData();
    }
  }

  /**
   * Renderiza la cuadrícula del calendario para el mes y año dados.
   * @param monthIndex El índice del mes (0-11).
   */
  renderCalendar(monthIndex: number) {
    const now = new Date();
    const year = now.getFullYear(); // Obtiene el año actual
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate(); // Número de días en el mes
    const firstDayOfWeek = new Date(year, monthIndex, 1).getDay(); // Día de la semana del primer día del mes (0=Dom, 1=Lun...)

    this.monthTitle = this.months[monthIndex]; // Actualiza el título del mes mostrado
    this.calendarDays = []; // Limpia el array de días antes de rellenarlo

    // Nombres de los días de la semana
    const weekdays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    weekdays.forEach(wDay => {
        this.calendarDays.push({ day: wDay, isWeekday: true }); // Añade los nombres de los días como objetos CalendarDay
    });

    // Rellenar con celdas vacías para los días antes del primer día del mes
    for (let i = 0; i < firstDayOfWeek; i++) {
      this.calendarDays.push({ day: '' }); // Agrega objetos con día vacío
    }

    // Rellenar con los días del mes
    for (let d = 1; d <= daysInMonth; d++) {
      this.calendarDays.push({ day: d, value: null }); // Agrega objetos para cada día, inicializando value en null
    }
  }

  /**
   * Inicia o detiene el contador y, si se detiene, inserta el valor en el día seleccionado.
   */
  toggleCounter() {
    if (!this.counting) {
      this.counting = true;
      this.intervalId = setInterval(() => {
        this.counter++;
      }, 1000); // Incrementa el contador cada segundo
    } else {
      this.counting = false;
      clearInterval(this.intervalId); // Detiene el contador

      if (this.selectedDayInput !== null && !isNaN(this.selectedDayInput)) {
        // Llama a insertValueInDayAndSave para actualizar el calendario y guardar en Firestore
        this.insertValueInDayAndSave(this.selectedDayInput, this.counter);
      }
      this.counter = 0; // Reinicia el contador
    }
  }

  /**
   * Actualiza el valor en el calendario y guarda en Firestore.
   * @param dayToUpdate El número del día del mes a actualizar.
   * @param value El valor numérico a insertar.
   */
  async insertValueInDayAndSave(dayToUpdate: number, value: number) {
    // 1. Actualiza el modelo de datos local del calendario
    const foundDay = this.calendarDays.find(
      cell => typeof cell.day === 'number' && cell.day === dayToUpdate
    );

    if (foundDay) {
      foundDay.value = value;
    }

    // 2. Guarda en Firestore
    if (this.currentUser && this.currentUser.uid) {
      const year = new Date().getFullYear();
      // Formatear la fecha para que sea una clave única en Firestore (ej. "2025-06-07")
      const dateKey = `${year}-${(this.currentMonthIndex + 1).toString().padStart(2, '0')}-${dayToUpdate.toString().padStart(2, '0')}`;

      // Referencia a la colección 'users' y luego al documento del usuario actual
      const userDocRef = doc(this.firestore, 'users', this.currentUser.uid);

      try {
        // Obtener el documento actual para ver si ya existen datos de días
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          // Si el documento existe, actualiza el mapa de 'dayData'
          await updateDoc(userDocRef, {
            [`dayData.${dateKey}`]: { value: value, timestamp: new Date().toISOString() }
          });
        } else {
          // Si el documento no existe, crea uno nuevo con el primer dato de día
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

  /**
   * Carga los datos de días para el usuario actual desde Firestore
   * y los aplica al calendario.
   */
  async loadUserDayData() {
    if (this.currentUser && this.currentUser.uid) {
      const userDocRef = doc(this.firestore, 'users', this.currentUser.uid);
      try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const dayData = userData['dayData'] || {}; // Obtiene el mapa de dayData

          const year = new Date().getFullYear();
          const currentMonthPadded = (this.currentMonthIndex + 1).toString().padStart(2, '0');

          // Itera sobre los días del calendario y aplica los valores guardados
          this.calendarDays.forEach(dayCell => {
            if (typeof dayCell.day === 'number') { // Solo para los días numerados
              const dateKey = `${year}-${currentMonthPadded}-${dayCell.day.toString().padStart(2, '0')}`;
              if (dayData[dateKey]) {
                dayCell.value = dayData[dateKey].value; // Asigna el valor guardado
              } else {
                dayCell.value = null; // Si no hay datos para ese día, asegúrate de que no se muestre nada
              }
            }
          });
          console.log('Datos de días cargados con éxito para el usuario:', this.currentUser.uid);
        } else {
          console.log('No existen datos de calendario para este usuario.');
          // Resetear los valores del calendario si no hay datos guardados
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