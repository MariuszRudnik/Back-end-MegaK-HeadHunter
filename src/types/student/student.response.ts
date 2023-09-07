import { rating } from "../user/user.import.type";
import {ExpectedContractType, ExpectedTypeWork } from "../user/user.register.type";
import {StudentEntity} from "../../student/student.entity";
import { HrEntity } from "src/hr/hr.entity";

export interface ChangeStudentStatusResponse {
    actionStatus: boolean;
    data: string | null;
}

export interface StudentCVResponse {
    id?: string;     
    email: string;
    courseCompletion: rating;
    courseEngagment: rating;
    projectDegree: rating;
    teamProjectDegree: rating;
    bonusProjectUrls: string[];
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
    hr: HrEntity | null;
}

export interface StudentsSelectedByHrResponse {
    actionStatus: boolean,
    message: StudentEntity[] | string,
}

export interface StudentListResponse {
    id: string;
    firstName: string;
    lastName: string;
    courseCompletion: rating;
    courseEngagment: rating;
    projectDegree: rating;
    teamProjectDegree: rating;
    expectedTypeWork: ExpectedTypeWork;
    targetWorkCity: string;
    expectedContractType: ExpectedContractType;
    expectedSalary: string | null;
    canTakeApprenticeship: boolean;
    monthsOfCommercialExp: number;
}
