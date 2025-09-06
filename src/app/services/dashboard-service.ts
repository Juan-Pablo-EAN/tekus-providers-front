import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environment/environment';
import { lastValueFrom, Subject } from 'rxjs';
import { ServiceCompleteDto } from '../interfaces/complete-provider-dto';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient)

  public serviceProvider : ServiceCompleteDto = {
    id: 0,
    name: '',
    valuePerHourUsd: '',
    countries: []
  };
  public $serviceProvider : Subject<ServiceCompleteDto>;

  constructor() {
    this.$serviceProvider = new Subject<ServiceCompleteDto>();
  }

  setServiceProvider(service: ServiceCompleteDto){
    this.serviceProvider = service;
    this.$serviceProvider.next(this.serviceProvider);
  }

  getServiceProvider(){
    return this.$serviceProvider.asObservable();
  }

  async getProvidersInfo(){
    const url = environment.apiUrl + '/Providers/GetCompleteProviders';
    let response : any;
    await lastValueFrom(this.http.get(url))
    .then(res => response = res);
    return response
  }
}
