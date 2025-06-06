// src/app/creacuen/creacuen.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreacuenComponent } from './creacuen.component';

describe('CreacuenComponent', () => {
  let component: CreacuenComponent;
  let fixture: ComponentFixture<CreacuenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreacuenComponent] // Importa el componente standalone aquí
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreacuenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

 
});