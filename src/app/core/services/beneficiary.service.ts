import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../base/base.service';
import { ReadBeneficiaryDto, WriteBeneficiaryDto, UpdateBeneficiaryDto } from '../models/beneficiary.models';

@Injectable({ providedIn: 'root' })
export class BeneficiaryService extends BaseService<ReadBeneficiaryDto, WriteBeneficiaryDto, UpdateBeneficiaryDto> {
  constructor(http: HttpClient) {
    super(http, 'Beneficiary');
  }
}
