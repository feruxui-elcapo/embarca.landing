export enum District {
  NATION = 'NATION',
  BOOSTER = 'BOOSTER',
  CONNECT = 'CONNECT',
  VC = 'VC',
  COWORK = 'COWORK',
}

export interface DistrictTheme {
  name: string;
  description: string;
  colors: string[];
  accent: string;
  icon: string;
}

export interface Author {
  id: string;
  name: string;
  imageUrl?: string;
}

