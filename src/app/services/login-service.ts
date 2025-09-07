import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly http = inject(HttpClient);

  async syncCountriesDatabase() {
    const url = environment.apiUrl + '/Countries/SyncCountriesList';
    lastValueFrom(this.http.post(url, {}));
  }
}
