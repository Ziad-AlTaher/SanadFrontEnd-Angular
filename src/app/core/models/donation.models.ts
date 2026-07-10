export enum DonationType {
  Cash = 1,
  InKind = 2,
  BankTransfer = 3
}

export interface DonationDto {
  id?: string;
  donorName?: string;
  amount?: number;
  donationType?: DonationType;
  donationDate?: string;
  isActive?: boolean;
}

export interface ReadDonationDto extends DonationDto {
}

export interface WriteDonationDto extends DonationDto {
}

export interface UpdateDonationDto extends DonationDto {
}
