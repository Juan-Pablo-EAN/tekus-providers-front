import { Component, inject, OnInit, signal, computed } from '@angular/core';
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
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ServiceCompleteDto, CountryCompleteDto } from '../../interfaces/complete-provider-dto';
import { DashboardService } from '../../services/dashboard-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dialog-services',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
  ],
  templateUrl: './dialog-services.html',
  styleUrl: './dialog-services.css',
})
export class DialogServices implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dashboardService = inject(DashboardService);
  private readonly dialogRef = inject(MatDialogRef<DialogServices>);

  public serviceProvider: ServiceCompleteDto = {
    id: 0,
    name: '',
    valuePerHourUsd: '',
    countries: [],
  };

  // Lista de países disponibles (simulada)
  availableCountries: CountryCompleteDto[] = [];

  serviceForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    valuePerHourUsd: ['', [Validators.required, Validators.min(0.01)]],
    countries: this.fb.array([]),
  });

  isLoading = signal(false);
  hasChanges = signal(false);
  formChangeSignal = signal(0);
  selectedCountryId = signal<number | null>(null);

  // Getter para el FormArray de países
  get countriesArray(): FormArray {
    return this.serviceForm.get('countries') as FormArray;
  }

  // Países disponibles para agregar (que no estén ya seleccionados)
  availableToAdd = computed(() => {
    this.formChangeSignal(); // Trigger reactivity

    if (!this.availableCountries || this.availableCountries.length === 0) {
      return [];
    }

    const selectedCountryIds = this.countriesArray.controls
      .map((control: any) => control.get('id')?.value)
      .filter((id) => id !== null && id !== undefined);

    return this.availableCountries.filter((country) => !selectedCountryIds.includes(country.id));
  });

  isFormValid = computed(() => {
    this.formChangeSignal(); // Trigger reactivity
    return this.serviceForm.valid && this.hasChanges();
  });

  ngOnInit(): void {
    // Primero cargar los países disponibles
    this.getCountries().then(() => {
      // Una vez cargados los países, cargar los datos del servicio
      this.loadServiceFromDashboard();

      // Configurar suscripciones después de cargar los datos
      this.setupFormSubscriptions();
    });
  }

  private loadServiceFromDashboard() {
    // Primero intentar obtener del servicio observable
    this.dashboardService.getServiceProvider().subscribe((service) => {
      if (service?.id) {
        this.serviceProvider = service;
        this.loadServiceData();
      }
    });

    // También usar el valor directo si está disponible
    if (this.dashboardService.serviceProvider?.id) {
      this.serviceProvider = this.dashboardService.serviceProvider;
      this.loadServiceData();
    }
  }

  private setupFormSubscriptions() {
    // Suscribirse a cambios en el formulario
    this.serviceForm.valueChanges.subscribe(() => {
      this.checkForChanges();
    });

    // Suscribirse a cambios en el FormArray de países
    this.countriesArray.statusChanges.subscribe(() => {
      this.formChangeSignal.update((v) => v + 1);
    });

    // También suscribirse a cambios de valor en el FormArray
    this.countriesArray.valueChanges.subscribe(() => {
      this.formChangeSignal.update((v) => v + 1);
    });
  }

  async getCountries() {
    try {
      const countries = await this.dashboardService.getCountriesList();
      if (countries && Array.isArray(countries)) {
        this.availableCountries = countries;
        console.log('Países cargados:', this.availableCountries.length);

        // Trigger reactivity después de cargar los países
        this.formChangeSignal.update((v) => v + 1);
      } else {
        console.warn('No se recibieron países válidos del servicio');
        // Fallback con países por defecto
        this.loadDefaultCountries();
      }
    } catch (error) {
      console.error('Error cargando países:', error);
      // Fallback con países por defecto
      this.loadDefaultCountries();
    }
  }

  private loadDefaultCountries() {
    this.availableCountries = [
      { id: 1, isocode: 'CO', name: 'Colombia', flagImage: 'https://flagcdn.com/w40/co.png' },
      { id: 2, isocode: 'US', name: 'Estados Unidos', flagImage: 'https://flagcdn.com/w40/us.png' },
      { id: 3, isocode: 'MX', name: 'México', flagImage: 'https://flagcdn.com/w40/mx.png' },
      { id: 4, isocode: 'AR', name: 'Argentina', flagImage: 'https://flagcdn.com/w40/ar.png' },
      { id: 5, isocode: 'BR', name: 'Brasil', flagImage: 'https://flagcdn.com/w40/br.png' },
      { id: 6, isocode: 'CL', name: 'Chile', flagImage: 'https://flagcdn.com/w40/cl.png' },
      { id: 7, isocode: 'PE', name: 'Perú', flagImage: 'https://flagcdn.com/w40/pe.png' },
      { id: 8, isocode: 'EC', name: 'Ecuador', flagImage: 'https://flagcdn.com/w40/ec.png' },
    ];
    console.log('Usando países por defecto');
  }

  // Cargar datos del servicio en el formulario
  private loadServiceData() {
    if (this.serviceProvider) {
      this.serviceForm.patchValue({
        name: this.serviceProvider.name,
        valuePerHourUsd: this.serviceProvider.valuePerHourUsd,
      });

      this.loadCountries();
    }
  }

  // Cargar países del servicio
  private loadCountries() {
    this.countriesArray.clear();
    if (this.serviceProvider.countries) {
      this.serviceProvider.countries.forEach((country) => {
        this.countriesArray.push(
          this.fb.group({
            id: [country.id],
            isocode: [country.isocode],
            name: [country.name],
            flagImage: [country.flagImage],
          })
        );
      });
    }
  }

  // Verificar si hay cambios en el formulario
  private checkForChanges() {
    if (!this.serviceProvider) {
      this.hasChanges.set(false);
      return;
    }

    const currentValues = this.serviceForm.value;

    // Verificar cambios en campos básicos
    const basicFieldsChanged =
      currentValues.name !== this.serviceProvider.name ||
      currentValues.valuePerHourUsd !== this.serviceProvider.valuePerHourUsd;

    // Verificar cambios en países
    const countriesChanged = this.haveCountriesChanged(currentValues.countries);

    this.hasChanges.set(basicFieldsChanged || countriesChanged);
    this.formChangeSignal.update((v) => v + 1);
  }

  // Verificar si han cambiado los países
  private haveCountriesChanged(currentCountries: any[]): boolean {
    const originalCountries = this.serviceProvider.countries || [];

    if (currentCountries.length !== originalCountries.length) {
      return true;
    }

    return currentCountries.some((current, index) => {
      const original = originalCountries[index];
      return !original || current.id !== original.id;
    });
  }

  // Agregar país
  addCountry() {
    const selectedId = this.selectedCountryId();
    console.log('Intentando agregar país con ID:', selectedId);
    console.log('Países disponibles:', this.availableCountries.length);
    console.log('Países disponibles para agregar:', this.availableToAdd().length);

    if (selectedId) {
      const country = this.availableCountries.find((c) => c.id === selectedId);
      console.log('País encontrado:', country);

      if (country) {
        this.countriesArray.push(
          this.fb.group({
            id: [country.id],
            isocode: [country.isocode],
            name: [country.name],
            flagImage: [country.flagImage],
          })
        );
        this.selectedCountryId.set(null);
        this.formChangeSignal.update((v) => v + 1);
        console.log('País agregado correctamente');
      } else {
        console.warn('No se encontró el país con ID:', selectedId);
      }
    } else {
      console.warn('No hay país seleccionado');
    }
  }

  // Eliminar país
  removeCountry(index: number) {
    if (this.countriesArray.length > 0) {
      this.countriesArray.removeAt(index);
      this.formChangeSignal.update((v) => v + 1);
    }
  }

  // Cerrar diálogo
  onClose() {
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

      const formValue = this.serviceForm.value;
      const updatedService: ServiceCompleteDto = {
        id: this.serviceProvider.id,
        name: formValue.name,
        valuePerHourUsd: formValue.valuePerHourUsd,
        countries: formValue.countries || [],
      };

      await this.dashboardService.updateServiceInfo(updatedService).then((response: any) => {
        if (response.message.includes('exitosamente')) {
          Swal.fire('Servicio actualizado exitosamente', '', 'success');
        }
        this.isLoading.set(false);
        this.dialogRef.close(updatedService);
      });
    }
  }

  // Obtener mensaje de error
  getFieldErrorMessage(fieldName: string): string {
    const field = this.serviceForm.get(fieldName);

    if (field?.hasError('required')) {
      switch (fieldName) {
        case 'name':
          return 'El nombre del servicio es requerido';
        case 'valuePerHourUsd':
          return 'El valor por hora es requerido';
        default:
          return 'Este campo es requerido';
      }
    }

    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }

    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }

    if (field?.hasError('min')) {
      return 'El valor debe ser mayor a 0';
    }

    return '';
  }

  // Verificar si el campo es inválido
  isFieldInvalid(fieldName: string): boolean {
    const field = this.serviceForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  // Verificar si el campo es válido
  isFieldValid(fieldName: string): boolean {
    const field = this.serviceForm.get(fieldName);
    return !!(field?.valid && field?.touched);
  }
}
