export enum MaritalStatus {
  Single = 0,
  Married = 1,
  Divorced = 2,
  Widowed = 3
}

export enum HealthStatus {
  Healthy = 0,
  KidneyDialysis = 1,
  BurnInjury = 2,
  Amputation = 3,
  ChronicIllness = 4
}

export interface BeneficiaryDto {
  id?: string;
  fullName?: string;
  nationalId?: string;
  phoneNumber?: string;
  address?: string;
  notes?: string;
  birthDate?: string;
  isActive?: boolean;
  maritalStatus?: MaritalStatus;
  healthStatus?: HealthStatus;
  numberOfDependents?: number;
}

export interface ReadBeneficiaryDto extends BeneficiaryDto {
  attachmentCount: number;
  aidDisbursementCount: number;
}

export interface WriteBeneficiaryDto extends BeneficiaryDto {
}

export interface UpdateBeneficiaryDto extends BeneficiaryDto {
}
