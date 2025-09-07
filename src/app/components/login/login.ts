import { Component, signal, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { LoginService } from '../../services/login-service';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatDividerModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  loginForm: FormGroup;
  loading = signal(false);
  hidePassword = signal(true);

  // Credenciales de demo
  private readonly demoCredentials = {
    email: 'admin@tekus.com',
    password: '123456',
  };

  private readonly loginService = inject(LoginService);

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  ngOnInit(): void {
    // Cargar email recordado si existe
    if (typeof localStorage !== 'undefined') {
      const rememberedEmail = localStorage.getItem('remembered_email');
      if (rememberedEmail) {
        this.loginForm.patchValue({
          email: rememberedEmail,
          rememberMe: true,
        });
      }

      this.loginForm.patchValue({
        email: this.demoCredentials.email,
        password: this.demoCredentials.password,
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid && !this.loading()) {
      this.loading.set(true);

      try {
        // Se sincronizan los países con los del servicio externo al momento de iniciar sesión
        this.loginService.syncCountriesDatabase();
        const formValue = this.loginForm.value;

        // Simular autenticación
        await this.simulateLogin(formValue.email, formValue.password);

        // Guardar email si "Recordar" está marcado
        if (formValue.rememberMe) {
          localStorage.setItem('remembered_email', formValue.email);
        } else {
          localStorage.removeItem('remembered_email');
        }

        // Guardar token simulado
        localStorage.setItem('auth_token', 'demo-token-' + Date.now());
        localStorage.setItem('user_email', formValue.email);

        this.showSuccess('¡Login exitoso! Bienvenido a Tekus');

        // Redirigir después del login exitoso
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
      } catch (error: any) {
        this.showError(error.message);
      } finally {
        this.loading.set(false);
      }
    } else {
      // Marcar campos como touched para mostrar errores
      Object.keys(this.loginForm.controls).forEach((key) => {
        this.loginForm.get(key)?.markAsTouched();
      });
      this.showError('Por favor, completa todos los campos correctamente');
    }
  }

  private async simulateLogin(email: string, password: string): Promise<void> {
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Validar credenciales demo
    if (email === this.demoCredentials.email && password === this.demoCredentials.password) {
      return; // Login exitoso
    } else {
      throw new Error('Credenciales incorrectas. Usa: admin@tekus.com / 123456');
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  fillDemoCredentials(): void {
    this.loginForm.patchValue({
      email: this.demoCredentials.email,
      password: this.demoCredentials.password,
    });
    this.showInfo('Credenciales de prueba cargadas');
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);

    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} es requerido`;
    }

    if (field?.hasError('email')) {
      return 'Ingresa un email válido';
    }

    if (field?.hasError('minlength')) {
      const requiredLength = field.getError('minlength')?.requiredLength || 6;
      return `La contraseña debe tener al menos ${requiredLength} caracteres`;
    }

    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      email: 'Email',
      password: 'Contraseña',
    };
    return labels[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar'],
    });
  }

  private showInfo(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 2000,
      panelClass: ['info-snackbar'],
    });
  }
}
