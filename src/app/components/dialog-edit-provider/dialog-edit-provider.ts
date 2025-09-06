import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CompleteProviderDto } from '../../interfaces/complete-provider-dto';
import { DashboardService } from '../../services/dashboard-service';

@Component({
  selector: 'app-dialog-edit-provider',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './dialog-edit-provider.html',
  styleUrl: './dialog-edit-provider.css',
})
export class DialogEditProvider implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<DialogEditProvider>);
  private readonly dashboardService = inject(DashboardService);

  public providerData: CompleteProviderDto = {
    id: 0,
    nit: '',
    name: '',
    email: '',
    customFields: [],
    services: [],
  };

  editForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    nit: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]],
    email: ['', [Validators.required, Validators.email]],
  });

  isLoading = signal(false);
  hasChanges = signal(false);

  isFormValid = computed(() => {
    return this.editForm.valid && this.hasChanges();
  });

  ngOnInit() {
    this.dashboardService.getProviderInfo().subscribe((provider) => {
      this.providerData = provider;
    });
    this.providerData = this.dashboardService.providerInfo;

    // Cargar los datos del proveedor en el formulario
    this.loadProviderData();

    this.editForm.valueChanges.subscribe(() => {
      this.checkForChanges();
    });
  }

  // Cargar datos del proveedor en el formulario
  private loadProviderData() {
    if (this.providerData) {
      this.editForm.patchValue({
        name: this.providerData.name,
        nit: this.providerData.nit,
        email: this.providerData.email,
      });
    }
  }

  // Verificar si hay cambios en el formulario
  private checkForChanges() {
    if (!this.providerData) {
      this.hasChanges.set(false);
      return;
    }

    const currentValues = this.editForm.value;
    const hasChanged =
      currentValues.name !== this.providerData.name ||
      currentValues.nit !== this.providerData.nit ||
      currentValues.email !== this.providerData.email;

    this.hasChanges.set(hasChanged);
  }

  // Cerrar diálogo sin guardar
  onCancel() {
    if (this.hasChanges()) {
      const confirmClose = confirm('¿Estás seguro de cerrar sin guardar los cambios?');
      if (confirmClose) {
        this.dialogRef.close();
      }
    } else {
      this.dialogRef.close();
    }
  }

  // Guardar cambios
  onSave() {
    if (this.isFormValid()) {
      this.isLoading.set(true);

      const updatedProvider: CompleteProviderDto = {
        id: this.providerData.id,
        ...this.editForm.value,
      };

      // Simular guardado
      setTimeout(() => {
        console.log('Proveedor actualizado:', updatedProvider);
        this.isLoading.set(false);
        this.dialogRef.close(updatedProvider);
      }, 1000);
    }
  }

  // Obtener mensaje de error para campos
  getFieldErrorMessage(fieldName: string): string {
    const field = this.editForm.get(fieldName);

    if (field?.hasError('required')) {
      switch (fieldName) {
        case 'name':
          return 'El nombre es requerido';
        case 'nit':
          return 'El NIT es requerido';
        case 'email':
          return 'El email es requerido';
        default:
          return 'Este campo es requerido';
      }
    }

    if (field?.hasError('email')) {
      return 'Ingresa un email válido';
    }

    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      switch (fieldName) {
        case 'name':
          return `El nombre debe tener al menos ${minLength} caracteres`;
        case 'nit':
          return `El NIT debe tener al menos ${minLength} caracteres`;
        default:
          return `Mínimo ${minLength} caracteres`;
      }
    }

    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      switch (fieldName) {
        case 'name':
          return `El nombre no puede superar ${maxLength} caracteres`;
        case 'nit':
          return `El NIT no puede superar ${maxLength} caracteres`;
        default:
          return `Máximo ${maxLength} caracteres`;
      }
    }

    return '';
  }

  // Obtener estado del campo
  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  // Obtener estado del campo válido
  isFieldValid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field?.valid && field?.touched);
  }
}
