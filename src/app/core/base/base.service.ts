import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env/environment';
import { Result } from '../models/api-response.model';

@Injectable()
export abstract class BaseService<TRead, TWrite = TRead, TUpdate = TRead> {
    protected apiUrl = environment.apiUrl;

    constructor(
        protected http: HttpClient,
        @Inject(String) protected endpoint: string
    ) { }

    getAll(): Observable<TRead[]> {
        return this.http.post<Result<{ listData: TRead[] }>>(`${this.apiUrl}/${this.endpoint}/GetAll`, {
            page: 1,
            pageSize: 10000000
        }).pipe(
            map(res => res.data.listData)
        );
    }

    getById(id: string | number): Observable<TRead> {
        return this.http.get<Result<TRead>>(`${this.apiUrl}/${this.endpoint}/${id}`).pipe(
            map(res => res.data)
        );
    }

    create(item: TWrite): Observable<TRead> {
        return this.http.post<Result<TRead>>(`${this.apiUrl}/${this.endpoint}`, item).pipe(
            map(res => res.data)
        );
    }

    update(id: string | number, item: TUpdate): Observable<TRead> {
        return this.http.put<Result<TRead>>(`${this.apiUrl}/${this.endpoint}/${id}`, item).pipe(
            map(res => res.data)
        );
    }

    delete(id: string | number): Observable<void> {
        return this.http.delete<Result<void>>(`${this.apiUrl}/${this.endpoint}/${id}`).pipe(
            map(() => undefined)
        );
    }

    toggleStatus(id: string | number): Observable<boolean> {
        return this.http.put<Result<boolean>>(`${this.apiUrl}/${this.endpoint}/ChangeStatus/${id}`, {}).pipe(
            map(res => res.data)
        );
    }
}
