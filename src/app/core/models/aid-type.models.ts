export interface AidTypeDto {
  id?: string;
  defaultValue?: number;
  description?: string;
  isActive?: boolean;
  name?: string;
}

export interface ReadAidTypeDto extends AidTypeDto {
}

export interface WriteAidTypeDto extends AidTypeDto {
}

export interface UpdateAidTypeDto extends AidTypeDto {
}
