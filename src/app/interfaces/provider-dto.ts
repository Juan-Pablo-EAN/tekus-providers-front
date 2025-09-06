export interface Providers {
  id: number;
  nit: string;
  name: string;
  email: string;
  customFields: CustomFields[];
  services: Services[]; 
}

export interface CustomFields {
  id: number;
  idProvider: number;
  fieldName: string;
  fieldValue: string;
}

export interface Services {
  id: number;
  name: string;
  valuePerHourUsd: string;
  countries: Countries[]; 
}

// Interfaz para Countries
export interface Countries {
  id: number;
  isocode: string;
  name: string;
  flagImage: string;
}

export interface ProvidersServices {
  id: number;
  idProvider: number;
  idService: number;
}

export interface ServicesCountries {
  id: number;
  idService: number;
  idCountry: number;
}