import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseService } from '../base/base.service';
import { ReadAttachmentDto } from '../models/attachment.models';
import { Result } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AttachmentService extends BaseService<ReadAttachmentDto, FormData, FormData> {
  constructor(http: HttpClient) {
    super(http, 'Attachment');
  }

  // Get attachments filtered by beneficiary id
  getByBeneficiaryId(beneficiaryId: string): Observable<ReadAttachmentDto[]> {
    return this.http.post<Result<{ listData: ReadAttachmentDto[] }>>(`${this.apiUrl}/${this.endpoint}/GetAll`, {
      page: 1,
      pageSize: 1000000,
      readDto: {
        beneficiaryId: beneficiaryId
      }
    }).pipe(
      map(res => res.data.listData)
    );
  }
}
