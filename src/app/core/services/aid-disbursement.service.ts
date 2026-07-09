import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../base/base.service';
import { ReadAidDisbursementDto, WriteAidDisbursementDto, UpdateAidDisbursementDto } from '../models/aid-disbursement.models';

@Injectable({ providedIn: 'root' })
export class AidDisbursementService extends BaseService<ReadAidDisbursementDto, WriteAidDisbursementDto, UpdateAidDisbursementDto> {
  constructor(http: HttpClient) {
    super(http, 'AidDisbursement');
  }
}
