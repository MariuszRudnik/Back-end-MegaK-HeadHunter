export enum ExpectedTypeWork {
  AT_LOCATION = 'atLocation', //praca na miejscu
  CHANGE_OF_LOCATION = 'changeOfLocation', //Gotowość do przeprowadzki
  MANUAL = 'manual', //Wyłącznie zdalnie
  IRRELEVANT = 'irrelevant', //Bez znaczenia (domyślnie)
}

export enum ExpectedContractType {
  UoP = 'UoP', //Tylko UoP
  B2B = 'B2B', //Możliwe B2B
  UZ_UoD = 'UZ/UoD', //Możliwe UZ/UoD
  IRRELEVANT = 'irrelevant', //Brak preferencji (domyślnie)
}

export interface UserRegisterType {
  id: string;
  password: string;
  email: string;
  tel: number;
  firstName: string;
  lastName: string;
  githubUsername: string;
  portfolioUrls: string[];
  projectUrls: string[];
  bio: string;
  expectedTypeWork: ExpectedTypeWork;
  targetWorkCity: string;
  expectedContractType: ExpectedContractType;
  expectedSalary: number | null;
  canTakeApprenticeship: boolean;
  monthsOfCommercialExp: number;
  education: string | null;
  workExperience: string;
  courses: string;
}
