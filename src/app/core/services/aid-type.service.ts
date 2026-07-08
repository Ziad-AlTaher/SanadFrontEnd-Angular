import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../base/base.service';
import { ReadAidTypeDto, WriteAidTypeDto, UpdateAidTypeDto } from '../models/aid-type.models';

@Injectable({ providedIn: 'root' })
export class AidTypeService extends BaseService<ReadAidTypeDto, WriteAidTypeDto, UpdateAidTypeDto> {
  constructor(http: HttpClient) {
    super(http, 'AidType');
  }
}
