import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Differentials } from './differentials';

describe('Differentials', () => {
  let component: Differentials;
  let fixture: ComponentFixture<Differentials>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Differentials],
    }).compileComponents();

    fixture = TestBed.createComponent(Differentials);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
