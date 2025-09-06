import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ServiceCompleteDto } from '../../interfaces/complete-provider-dto';
import { DashboardService } from '../../services/dashboard-service';

@Component({
  selector: 'app-dialog-services',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './dialog-services.html',
  styleUrl: './dialog-services.css',
})
export class DialogServices implements OnInit {
  public serviceProvider: ServiceCompleteDto = {
    id: 0,
    name: '',
    valuePerHourUsd: '',
    countries: [],
  };

  private readonly dashboardService = inject(DashboardService);
  private readonly dialogRef = inject(MatDialogRef<DialogServices>);

  ngOnInit(): void {
    this.dashboardService.getServiceProvider().subscribe(service => {
      this.serviceProvider = service;
    });

    this.serviceProvider = this.dashboardService.serviceProvider;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onEdit(): void {
    this.dialogRef.close('edit');
  }

  onDelete(): void {
    this.dialogRef.close('delete');
  }

  formatCurrency(value: string): string {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '$0.00 USD';
    return `$${numValue.toFixed(2)} USD`;
  }

  getCountryFlag(countryCode: string): string {
    return `https://flagcdn.com/16x12/${countryCode.toLowerCase()}.png`;
  }
}
