import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
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

interface Country {
  code: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
  valuePerHourUsd: number;
  countries: Country[];
}

interface ProviderData {
  name: string;
  nit: string;
  email: string;
  services: Service[];
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
    MatTooltipModule
  ],
  templateUrl: './dialog-new-provider.html',
  styleUrl: './dialog-new-provider.css'
})
export class DialogNewProvider {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<DialogNewProvider>);

  // Lista de países disponibles
  availableCountries: Country[] = [
    { code: 'CO', name: 'Colombia' },
    { code: 'US', name: 'Estados Unidos' },
    { code: 'MX', name: 'México' },
    { code: 'BR', name: 'Brasil' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CL', name: 'Chile' },
    { code: 'PE', name: 'Perú' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'ES', name: 'España' },
    { code: 'FR', name: 'Francia' },
    { code: 'DE', name: 'Alemania' },
    { code: 'IT', name: 'Italia' },
    { code: 'GB', name: 'Reino Unido' },
    { code: 'CA', name: 'Canadá' }
  ];

  providerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    nit: ['', [Validators.required, Validators.minLength(8)]],
    email: ['', [Validators.required, Validators.email]],
    services: this.fb.array([])
  });

  isLoading = signal(false);
  currentServiceIndex = signal(-1);
  
  isFormValid = computed(() => {
    return this.providerForm.valid && this.servicesArray.length > 0;
  });

  get servicesArray() {
    return this.providerForm.get('services') as FormArray;
  }

  // Agregar un nuevo servicio
  addService() {
    const serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      valuePerHourUsd: ['', [Validators.required]],
      countries: [[], [Validators.required, Validators.minLength(1)]]
    });

    this.servicesArray.push(serviceForm);
    this.currentServiceIndex.set(this.servicesArray.length - 1);
  }

  // Remover un servicio
  removeService(index: number) {
    this.servicesArray.removeAt(index);
    if (this.currentServiceIndex() >= this.servicesArray.length) {
      this.currentServiceIndex.set(this.servicesArray.length - 1);
    }
  }

  // Agregar país a un servicio
  addCountryToService(serviceIndex: number, country: Country) {
    const serviceForm = this.servicesArray.at(serviceIndex);
    const currentCountries = serviceForm.get('countries')?.value || [];
    
    if (!currentCountries.some((c: Country) => c.code === country.code)) {
      const updatedCountries = [...currentCountries, country];
      serviceForm.get('countries')?.setValue(updatedCountries);
    }
  }

  // Remover país de un servicio
  removeCountryFromService(serviceIndex: number, countryCode: string) {
    const serviceForm = this.servicesArray.at(serviceIndex);
    const currentCountries = serviceForm.get('countries')?.value || [];
    const filteredCountries = currentCountries.filter((c: Country) => c.code !== countryCode);
    serviceForm.get('countries')?.setValue(filteredCountries);
  }

  // Obtener países disponibles para un servicio (que no estén ya seleccionados)
  getAvailableCountriesForService(serviceIndex: number): Country[] {
    const serviceForm = this.servicesArray.at(serviceIndex);
    const selectedCountries = serviceForm.get('countries')?.value || [];
    return this.availableCountries.filter(
      country => !selectedCountries.some((c: Country) => c.code === country.code)
    );
  }

  // Validar formulario de servicio
  isServiceValid(index: number): boolean {
    const serviceForm = this.servicesArray.at(index);
    return serviceForm.valid;
  }

  // Cerrar diálogo
  onCancel() {
    this.dialogRef.close();
  }

  // Guardar proveedor
  onSave() {
    if (this.isFormValid()) {
      this.isLoading.set(true);
      
      const providerData: ProviderData = {
        ...this.providerForm.value,
        services: this.servicesArray.value
      };

      // Simular guardado
      setTimeout(() => {
        console.log('Proveedor a guardar:', providerData);
        this.isLoading.set(false);
        this.dialogRef.close(providerData);
      }, 1500);
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
}
