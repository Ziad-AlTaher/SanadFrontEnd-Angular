import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from '../base/base.service';
import { ReadBeneficiaryDto, WriteBeneficiaryDto, UpdateBeneficiaryDto } from '../models/beneficiary.models';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Result } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class BeneficiaryService extends BaseService<ReadBeneficiaryDto, WriteBeneficiaryDto, UpdateBeneficiaryDto> {
  constructor(http: HttpClient) {
    super(http, 'Beneficiary');
  }

  importFromExcel(file: File): Observable<any[]> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Result<any[]>>(`${this.apiUrl}/${this.endpoint}/ImportFromExcel`, formData).pipe(
      map(res => res.data)
    );
  }

  exportBeneficiariesToExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${this.endpoint}/ExportBeneficiariesToExcel`, {
      responseType: 'blob'
    });
  }

  exportEmptyTemplate(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${this.endpoint}/ExportEmptyTemplate`, {
      responseType: 'blob'
    });
  }
}

