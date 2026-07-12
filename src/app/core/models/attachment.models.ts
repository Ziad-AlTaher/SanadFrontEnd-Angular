export enum FileType {
  Image = 1,
  Pdf = 2,
  Word = 3,
  Excel = 4,
  Other = 5
}

export interface AttachmentDto {
  id?: string;
  fileName?: string;
  filePath?: string;
  fileType?: FileType;
  beneficiaryId?: string;
  isActive?: boolean;
}

export interface ReadAttachmentDto extends AttachmentDto {
}

export interface WriteAttachmentDto extends AttachmentDto {
  file: File;
}

export interface UpdateAttachmentDto extends AttachmentDto {
  file?: File;
}
