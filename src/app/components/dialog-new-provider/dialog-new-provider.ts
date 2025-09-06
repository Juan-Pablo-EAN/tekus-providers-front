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
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DashboardService } from '../../services/dashboard-service';
import { CompleteProviderDto } from '../../interfaces/complete-provider-dto';
import Swal from 'sweetalert2';

interface Country {
  isocode: string;
  name: string;
  flagImage: string;
}

@Component({
  selector: 'app-dialog-new-provider',
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
    MatChipsModule,
    MatSelectModule,
    MatDividerModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  templateUrl: './dialog-new-provider.html',
  styleUrl: './dialog-new-provider.css',
})
export class DialogNewProvider implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<DialogNewProvider>);
  private readonly dashboardService = inject(DashboardService);

  availableCountries: Country[] = [];

  providerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    nit: ['', [Validators.required, Validators.minLength(8)]],
    email: ['', [Validators.required, Validators.email]],
    services: this.fb.array([]),
    customFields: this.fb.array([]),
  });

  isLoading = signal(false);
  currentServiceIndex = signal(-1);
  private readonly formChangeSignal = signal(0);

  isFormValid = computed(() => {
    this.formChangeSignal();

    const isBasicFormValid = this.providerForm.valid;
    const hasServices = this.servicesArray.length > 0;

    return isBasicFormValid && hasServices;
  });

  get servicesArray() {
    return this.providerForm.get('services') as FormArray;
  }

  get customFieldsArray() {
    return this.providerForm.get('customFields') as FormArray;
  }

  ngOnInit(): void {
    this.getCountries();

    this.providerForm.valueChanges.subscribe(() => {
      this.formChangeSignal.update((val) => val + 1);
    });

    this.servicesArray.statusChanges.subscribe(() => {
      this.formChangeSignal.update((val) => val + 1);
    });

    this.customFieldsArray.statusChanges.subscribe(() => {
      this.formChangeSignal.update((val) => val + 1);
    });
  }

  async getCountries() {
    await this.dashboardService.getCountriesList().then((res: any) => {
      this.availableCountries = res;
    });
  }

  // Agregar un nuevo servicio
  addService() {
    const serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      valuePerHourUsd: ['', [Validators.required]],
      countries: [[], [Validators.required, Validators.minLength(1)]],
    });

    this.servicesArray.push(serviceForm);
    this.currentServiceIndex.set(this.servicesArray.length - 1);

    // Suscribirse a cambios del nuevo servicio
    serviceForm.statusChanges.subscribe(() => {
      this.formChangeSignal.update((val) => val + 1);
    });

    this.formChangeSignal.update((val) => val + 1);
  }

  // Remover un servicio
  removeService(index: number) {
    this.servicesArray.removeAt(index);
    if (this.currentServiceIndex() >= this.servicesArray.length) {
      this.currentServiceIndex.set(this.servicesArray.length - 1);
    }

    this.formChangeSignal.update((val) => val + 1);
  }

  // Agregar país a un servicio
  addCountryToService(serviceIndex: number, country: Country) {
    const serviceForm = this.servicesArray.at(serviceIndex);
    const currentCountries = serviceForm.get('countries')?.value || [];

    if (!currentCountries.some((c: Country) => c.isocode === country.isocode)) {
      const updatedCountries = [...currentCountries, country];
      serviceForm.get('countries')?.setValue(updatedCountries);

      this.formChangeSignal.update((val) => val + 1);
    }
  }

  // Remover país de un servicio
  removeCountryFromService(serviceIndex: number, countryCode: string) {
    const serviceForm = this.servicesArray.at(serviceIndex);
    const currentCountries = serviceForm.get('countries')?.value || [];
    const filteredCountries = currentCountries.filter((c: Country) => c.isocode !== countryCode);
    serviceForm.get('countries')?.setValue(filteredCountries);

    this.formChangeSignal.update((val) => val + 1);
  }

  // Obtener países disponibles para un servicio (que no estén ya seleccionados)
  getAvailableCountriesForService(serviceIndex: number): Country[] {
    const serviceForm = this.servicesArray.at(serviceIndex);
    const selectedCountries = serviceForm.get('countries')?.value || [];
    return this.availableCountries.filter(
      (country) => !selectedCountries.some((c: Country) => c.isocode === country.isocode)
    );
  }

  // Validar formulario de servicio
  isServiceValid(index: number): boolean {
    const serviceForm = this.servicesArray.at(index);
    return serviceForm.valid;
  }

  // Cerrar diálogo
  onCancel() {
    this.dialogRef.close({ valid: false });
  }

  // Guardar proveedor
  async onSave() {
    if (this.isFormValid()) {
      this.isLoading.set(true);

      const providerData: CompleteProviderDto = {
        ...this.providerForm.value,
        services: this.servicesArray.value,
        customFields: this.customFieldsArray.value,
      };

      await this.dashboardService.createNewProvider(providerData).then((response: any) => {
        if (response.message.includes('OK')) {
          Swal.fire('Proveedor creado exitosamente', '', 'success');
        }
        this.isLoading.set(false);
        this.dialogRef.close({ valid: true });
      });
    }
  }

  // Obtener mensaje de error para campos
  getFieldErrorMessage(fieldName: string): string {
    const field = this.providerForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName} es requerido`;
    }
    if (field?.hasError('email')) {
      return 'Email no válido';
    }
    if (field?.hasError('minlength')) {
      return `Mínimo ${field.errors?.['minlength'].requiredLength} caracteres`;
    }
    return '';
  }

  // Obtener mensaje de error para servicios
  getServiceFieldErrorMessage(serviceIndex: number, fieldName: string): string {
    const serviceForm = this.servicesArray.at(serviceIndex);
    const field = serviceForm.get(fieldName);

    if (field?.hasError('required')) {
      return `${fieldName} es requerido`;
    }
    if (field?.hasError('minlength')) {
      return `Mínimo ${field.errors?.['minlength'].requiredLength} caracteres`;
    }
    return '';
  }

  // Contar servicios válidos
  getValidServicesCount(): number {
    let validCount = 0;
    for (let i = 0; i < this.servicesArray.length; i++) {
      if (this.isServiceValid(i)) {
        validCount++;
      }
    }
    return validCount;
  }

  // Agregar un nuevo campo personalizado
  addCustomField() {
    const fieldForm = this.fb.group({
      fieldName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      fieldValue: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
    });

    this.customFieldsArray.push(fieldForm);

    fieldForm.statusChanges.subscribe(() => {
      this.formChangeSignal.update((val) => val + 1);
    });

    this.formChangeSignal.update((val) => val + 1);
  }

  // Remover un campo personalizado
  removeCustomField(index: number) {
    this.customFieldsArray.removeAt(index);

    this.formChangeSignal.update((val) => val + 1);
  }

  // Validar formulario de campo personalizado
  isCustomFieldValid(index: number): boolean {
    const fieldForm = this.customFieldsArray.at(index);
    return fieldForm.valid;
  }

  // Obtener mensaje de error para campos personalizados
  getCustomFieldErrorMessage(fieldIndex: number, fieldName: string): string {
    const fieldForm = this.customFieldsArray.at(fieldIndex);
    const field = fieldForm.get(fieldName);

    if (field?.hasError('required')) {
      switch (fieldName) {
        case 'fieldName':
          return 'El nombre del campo es requerido';
        case 'fieldValue':
          return 'El valor del campo es requerido';
        default:
          return 'Este campo es requerido';
      }
    }

    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      switch (fieldName) {
        case 'fieldName':
          return `El nombre debe tener al menos ${minLength} caracteres`;
        case 'fieldValue':
          return `El valor debe tener al menos ${minLength} caracteres`;
        default:
          return `Mínimo ${minLength} caracteres`;
      }
    }

    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      switch (fieldName) {
        case 'fieldName':
          return `El nombre no puede superar ${maxLength} caracteres`;
        case 'fieldValue':
          return `El valor no puede superar ${maxLength} caracteres`;
        default:
          return `Máximo ${maxLength} caracteres`;
      }
    }

    return '';
  }

  // Contar campos personalizados válidos
  getValidCustomFieldsCount(): number {
    let validCount = 0;
    for (let i = 0; i < this.customFieldsArray.length; i++) {
      if (this.isCustomFieldValid(i)) {
        validCount++;
      }
    }
    return validCount;
  }
}
