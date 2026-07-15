export interface AidDisbursementDto {
  id?: string;
  beneficiaryId?: string;
  aidTypeId?: string;
  amount?: number;
  disbursementDate?: string;
  isActive?: boolean;
  inKindName?: string;
  notes?: string;
}

export interface ReadAidDisbursementDto extends AidDisbursementDto {
  beneficiaryName?: string;
  aidTypeName?: string;
}

export interface WriteAidDisbursementDto extends AidDisbursementDto {
}

export interface UpdateAidDisbursementDto extends AidDisbursementDto {
}
