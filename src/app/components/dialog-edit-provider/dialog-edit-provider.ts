import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
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
import { MatChipsModule } from '@angular/material/chips';
import { TextFieldModule } from '@angular/cdk/text-field';
import {
  CompleteProviderDto,
  CustomFieldCompleteDto,
} from '../../interfaces/complete-provider-dto';
import { DashboardService } from '../../services/dashboard-service';
import Swal from 'sweetalert2';

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
    MatChipsModule,
    TextFieldModule,
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
    customFields: this.fb.array([]),
  });

  isLoading = signal(false);
  hasChanges = signal(false);
  formChangeSignal = signal(0);

  get customFieldsArray(): FormArray {
    return this.editForm.get('customFields') as FormArray;
  }

  isFormValid = computed(() => {
    this.formChangeSignal();
    const basicFieldsValid = this.editForm.get('name')?.valid && 
                            this.editForm.get('nit')?.valid && 
                            this.editForm.get('email')?.valid;
    
    const customFieldsValid = this.customFieldsArray.valid;
    
    return basicFieldsValid && customFieldsValid && this.hasChanges();
  });

  ngOnInit() {
    this.dashboardService.getProviderInfo().subscribe((provider) => {
      this.providerData = provider;
    });
    this.providerData = this.dashboardService.providerInfo;

    this.loadProviderData();

    this.editForm.valueChanges.subscribe(() => {
      this.checkForChanges();
    });

    this.customFieldsArray.statusChanges.subscribe(() => {
      this.formChangeSignal.update((v) => v + 1);
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

      // Cargar campos personalizados
      this.loadCustomFields();
    }
  }

  // Cargar campos personalizados del proveedor
  private loadCustomFields() {
    this.customFieldsArray.clear();
    if (this.providerData.customFields) {
      this.providerData.customFields.forEach((field) => {
        this.customFieldsArray.push(this.createCustomFieldGroup(field));
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
    
    // Verificar cambios en campos básicos
    const basicFieldsChanged =
      currentValues.name !== this.providerData.name ||
      currentValues.nit !== this.providerData.nit ||
      currentValues.email !== this.providerData.email;

    // Verificar cambios en campos personalizados
    const customFieldsChanged = this.haveCustomFieldsChanged(currentValues.customFields);

    // Hay cambios si cualquiera de los dos grupos ha cambiado
    this.hasChanges.set(basicFieldsChanged || customFieldsChanged);
    
    // También activar el signal para reactivity
    this.formChangeSignal.update(v => v + 1);
  }

  // Verificar si han cambiado los campos personalizados
  private haveCustomFieldsChanged(currentCustomFields: any[]): boolean {
    const originalFields = this.providerData.customFields || [];
    
    const validCurrentFields = currentCustomFields.filter(field => 
      field.fieldName && field.fieldName.trim() !== '' &&
      field.fieldValue && field.fieldValue.trim() !== ''
    );
    
    // Si la cantidad de campos válidos cambió
    if (validCurrentFields.length !== originalFields.length) {
      return true;
    }

    // Verificar si el contenido de los campos válidos cambió
    return validCurrentFields.some((current, index) => {
      const original = originalFields[index];
      return !original || 
             current.fieldName !== original.fieldName || 
             current.fieldValue !== original.fieldValue;
    });
  }

  // Crear un grupo de formulario para un campo personalizado
  createCustomFieldGroup(field?: CustomFieldCompleteDto): FormGroup {
    return this.fb.group({
      id: [field?.id || 0],
      fieldName: [
        field?.fieldName || '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
      ],
      fieldValue: [
        field?.fieldValue || '',
        [Validators.required, Validators.minLength(1), Validators.maxLength(200)],
      ],
    });
  }

  // Agregar nuevo campo personalizado
  addCustomField() {
    this.customFieldsArray.push(this.createCustomFieldGroup());
    this.formChangeSignal.update((v) => v + 1);
  }

  // Eliminar campo personalizado
  removeCustomField(index: number) {
    if (this.customFieldsArray.length > 0) {
      this.customFieldsArray.removeAt(index);
      this.formChangeSignal.update((v) => v + 1);
    }
  }

  // Obtener mensaje de error para campos personalizados
  getCustomFieldErrorMessage(fieldName: string, index: number): string {
    const field = this.customFieldsArray.at(index).get(fieldName);

    if (field?.hasError('required')) {
      return fieldName === 'fieldName'
        ? 'El nombre del campo es requerido'
        : 'El valor del campo es requerido';
    }

    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }

    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }

    return '';
  }

  // Verificar si el campo personalizado es inválido
  isCustomFieldInvalid(fieldName: string, index: number): boolean {
    const field = this.customFieldsArray.at(index).get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  // Verificar si el campo personalizado es válido
  isCustomFieldValid(fieldName: string, index: number): boolean {
    const field = this.customFieldsArray.at(index).get(fieldName);
    return !!(field?.valid && field?.touched);
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
  async onSave() {
    if (this.isFormValid()) {
      this.isLoading.set(true);

      const formValue = this.editForm.value;
      
      // Filtrar solo los campos personalizados que están completos
      const validCustomFields = formValue.customFields.filter((field: any) => 
        field.fieldName && field.fieldName.trim() !== '' &&
        field.fieldValue && field.fieldValue.trim() !== ''
      );

      const updatedProvider: CompleteProviderDto = {
        id: this.providerData.id,
        name: formValue.name,
        nit: formValue.nit,
        email: formValue.email,
        customFields: validCustomFields,
        services: this.providerData.services, // Mantener servicios existentes
      };

      await this.dashboardService.updateProviderInfo(updatedProvider).then((response: any) => {
        if (response.message.includes('exitosamente')) {
          Swal.fire('Proveedor actualizado exitosamente', '', 'success');
          this.isLoading.set(false);
          this.dialogRef.close(updatedProvider);
        }
      });
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
