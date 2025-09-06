import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { lastValueFrom, Subject } from 'rxjs';
import { CompleteProviderDto, ServiceCompleteDto } from '../interfaces/complete-provider-dto';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);

  public serviceProvider: ServiceCompleteDto = {
    id: 0,
    name: '',
    valuePerHourUsd: '',
    countries: [],
  };
  public $serviceProvider: Subject<ServiceCompleteDto>;
  public providerInfo: CompleteProviderDto = {
    id: 0,
    nit: '',
    name: '',
    email: '',
    customFields: [],
    services: [],
  };
  public $providerInfo: Subject<CompleteProviderDto>;

  constructor() {
    this.$serviceProvider = new Subject<ServiceCompleteDto>();
    this.$providerInfo = new Subject<CompleteProviderDto>();
  }

  setServiceProvider(service: ServiceCompleteDto) {
    this.serviceProvider = service;
    this.$serviceProvider.next(this.serviceProvider);
  }

  getServiceProvider() {
    return this.$serviceProvider.asObservable();
  }

  setProviderInfo(provider: CompleteProviderDto) {
    this.providerInfo = provider;
    this.$providerInfo.next(this.providerInfo);
  }

  getProviderInfo() {
    return this.$providerInfo.asObservable();
  }

  async getProvidersInfo() {
    const url = environment.apiUrl + '/Providers/GetCompleteProviders';
    let response: any;
    await lastValueFrom(this.http.get(url)).then((res) => (response = res));
    return response;
  }

  async deleteProvider(id: number){
    const url = environment.apiUrl + '/Providers/DeleteProvider/' + id;
    return await lastValueFrom(this.http.delete(url));
  }

  async getCountriesList(){
    const url = environment.apiUrl + '/Countries/GetCountriesFromDb';
    return await lastValueFrom(this.http.get(url));
  }

  async createNewProvider(providerData: CompleteProviderDto){
    const url = environment.apiUrl + '/Providers/CreateNewProvider';
    const body = {
      ObjectRequest: JSON.stringify(providerData)
    }
    return await lastValueFrom(this.http.post(url, body));
  }

  async updateProviderInfo(providerData: CompleteProviderDto){
    const url = environment.apiUrl + '/Providers/UpdateProvider';
    const body = {
      ObjectRequest: JSON.stringify(providerData)
    }
    return await lastValueFrom(this.http.put(url, body));
  }
}
