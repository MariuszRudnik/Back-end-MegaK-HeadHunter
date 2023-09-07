import { ExpectedContractType, ExpectedTypeWork } from "src/types/user/user.register.type";

export class StudentExtendedDataPatch {
    tel: string;
    firstName: string;
    lastName: string;
    githubUsername: string;
    portfolioUrls: string[];
    projectUrls: string[];
    bio: string;
    expectedTypeWork: ExpectedTypeWork;
    targetWorkCity: string;
    expectedContractType: ExpectedContractType;
    expectedSalary: string | null;
    canTakeApprenticeship: boolean;
    monthsOfCommercialExp: number;
    education: string | null;
    workExperience: string;
    courses: string;
}

export class StudentExtendedData extends StudentExtendedDataPatch {
    password: string;
    email: string;
}