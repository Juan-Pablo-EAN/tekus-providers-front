import {
  Component,
  inject,
  OnInit,
  signal,
  ViewChild,
  computed,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard-service';
import { CompleteProviderDto, ServiceCompleteDto } from '../../interfaces/complete-provider-dto';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DialogServices } from '../dialog-services/dialog-services';
import { DialogNewProvider } from '../dialog-new-provider/dialog-new-provider';
import { DialogEditProvider } from '../dialog-edit-provider/dialog-edit-provider';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatToolbarModule,
    MatTooltipModule,
    MatChipsModule,
    MatDialogModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'nit', 'name', 'email', 'services', 'actions'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private readonly dashboardService = inject(DashboardService);
  private readonly dialog = inject(MatDialog);

  providers = signal<CompleteProviderDto[]>([]);
  dataSource = new MatTableDataSource<CompleteProviderDto>([]);
  searchTerm = signal<string>('');

  // Computed para filtrar los datos
  filteredProviders = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const allProviders = this.providers();

    if (!term) return allProviders;

    return allProviders.filter(
      (provider) =>
        provider.name.toLowerCase().includes(term) ||
        provider.email.toLowerCase().includes(term) ||
        provider.nit?.toLowerCase().includes(term) ||
        provider.services.some((service) => service.name.toLowerCase().includes(term))
    );
  });

  ngOnInit(): void {
    this.getProviders();
  }

  ngAfterViewInit(): void {
    // Configurar paginador y ordenamiento
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Configurar filtro personalizado
    this.dataSource.filterPredicate = (data: CompleteProviderDto, filter: string) => {
      const term = filter.toLowerCase();
      return (
        data.name.toLowerCase().includes(term) ||
        data.email.toLowerCase().includes(term) ||
        (data.nit?.toLowerCase().includes(term) ?? false) ||
        data.services.some((service) => service.name.toLowerCase().includes(term))
      );
    };
  }

  async getProviders() {
    await this.dashboardService.getProvidersInfo().then((res) => {
      this.providers.set(res as CompleteProviderDto[]);
      this.dataSource.data = res as CompleteProviderDto[];
    });
  }

  // Método para aplicar filtro de búsqueda
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.searchTerm.set(filterValue);
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Método para limpiar búsqueda
  clearSearch(): void {
    this.searchTerm.set('');
    this.dataSource.filter = '';
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onCreateProvider(): void {
    const dialogRef = this.dialog.open(DialogNewProvider);

    dialogRef.afterClosed().subscribe((result) => {
      if(result?.valid){
        this.getProviders();
      }
    });
  }

  onEditProvider(provider: CompleteProviderDto): void {
    this.dashboardService.setProviderInfo(provider);
    const dialogRef = this.dialog.open(DialogEditProvider);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

  onDeleteProvider(provider: CompleteProviderDto): void {
    Swal.fire({
      icon: 'warning',
      html: '¿Deseas eliminar ' + provider.name + ' de los proveedores?',
      showCloseButton: true,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Eliminar',
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response: any = await this.dashboardService.deleteProvider(provider.id);
        if (response.message.includes('exitosamente')) {
          Swal.fire(response.message, '', 'success');
          const currentProviders = this.providers();
          const updatedProviders = currentProviders.filter((p) => p.id !== provider.id);
          this.providers.set(updatedProviders);
          // Actualizar dataSource
          this.dataSource.data = updatedProviders;
        }
      }
    });
  }

  getStatusColor(status: string): string {
    return status === 'active' ? 'primary' : 'warn';
  }

  getStatusText(status: string): string {
    return status === 'active' ? 'Activo' : 'Inactivo';
  }

  showInfoService(service: ServiceCompleteDto) {
    this.dashboardService.setServiceProvider(service);
    const dialogRef = this.dialog.open(DialogServices);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
