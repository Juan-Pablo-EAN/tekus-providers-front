export interface Providers {
  id: number;
  nit: string;
  name: string;
  email: string;
  customFields: CustomFields[];
  services: Services[]; 
}

export interface CustomFields {
  fieldName: string;
  fieldValue: string;
}

export interface Services {
  name: string;
  valuePerHourUsd: string;
  countries: Countries[]; 
}

// Interfaz para Countries
export interface Countries {
  isocode: string;
  name: string;
  flagImage: string;
}