import type { CountryRecord } from "../types";

export type CountriesApiResponse =
  | CountryRecord[]
  | {
      success?: boolean;
      message?: string;
      data?: CountryRecord[];
    };

export declare function getCountries(): Promise<CountriesApiResponse>;
