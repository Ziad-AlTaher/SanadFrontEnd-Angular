export enum Gender {
    Male = 1,
    Female = 2
}

export interface GetUserDto {
    id?: number;
    employeeId?: number;
    name?: string;
    phoneNumber?: string;
    phoneNumberCountryId?: number;
    phoneNumberCountryCode?: string;
    defaultLanguage?: string;
    email?: string;
    address?: string;
    nationalityId?: number;
    nationality?: string;
    commercialName?: string;
    userName?: string;
    employeeName?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    positionName?: string;
    departmentName?: string;
    image?: string;
    branchName?: string;
    searchRoles?: string;
    roles?: string[];
    isActive?: boolean;
    forcePasswordChange?: boolean;
}

export interface ClientProfile {
    id?: number;
    firstName?: string;
    email?: string;
    nationalId?: string;
    gender?: Gender;
    genderName?: string;
    image?: string;
}

export interface UpdateUserDto {
    name?: string;
    phoneNumber?: string;
    userName?: string;
    phoneNumberCountryId?: number;
    email?: string;
    address?: string;
    nationality?: string;
    password?: string;
    confirmPassword?: string;
    defaultLanguage?: string;
    nationalityId?: number;
    roles?: string[];
    isActive: boolean;
    forcePasswordChange: boolean;
}

export interface AddUserDto {
    requiredPassWord?: boolean;
    phoneNumber?: string;
    phoneNumberCountryId?: number;
    nationalityId?: number;
    email?: string;
    userName?: string;
    password?: string;
    defaultLanguage?: string;
    confirmPassword?: string;
    address?: string;
    nationality?: string;
    roles?: string[];
    sendDataToMail: boolean;
    isActive: boolean;
    forcePasswordChange: boolean;
}

