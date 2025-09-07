export interface CompleteProviderDto {
  id: number;
  nit: string;
  name: string;
  email: string;
  customFields: CustomFieldCompleteDto[];
  services: ServiceCompleteDto[];
}

export interface CustomFieldCompleteDto {
  id: number;
  fieldName: string;
  fieldValue: string;
}

export interface ServiceCompleteDto {
  id: number;
  name: string;
  valuePerHourUsd: string;
  countries: CountryCompleteDto[];
}

export interface CountryCompleteDto {
  id: number;
  isocode: string;
  name: string;
  flagImage: string;
}