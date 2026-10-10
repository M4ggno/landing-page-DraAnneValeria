import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParticleField } from './particle-field';

describe('ParticleField', () => {
  let component: ParticleField;
  let fixture: ComponentFixture<ParticleField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticleField],
    }).compileComponents();

    fixture = TestBed.createComponent(ParticleField);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
