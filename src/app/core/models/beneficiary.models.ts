export interface BeneficiaryDto {
  id?: string;
  fullName?: string;
  nationalId?: string;
  phoneNumber?: string;
  address?: string;
  notes?: string;
  birthDate?: string;
  isActive?: boolean;
}

export interface ReadBeneficiaryDto extends BeneficiaryDto {
  attachmentCount: number;
  aidDisbursementCount: number;
}

export interface WriteBeneficiaryDto extends BeneficiaryDto {
}

export interface UpdateBeneficiaryDto extends BeneficiaryDto {
}
