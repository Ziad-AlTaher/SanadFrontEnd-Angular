import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Result } from '../models/api-response.model';
import { ReadAppPermissionDto } from '../models/permission.models';

@Injectable({
    providedIn: 'root'
})
export class AppPermissionService {
    private apiUrl = `${environment.apiUrl}/AppPermissionService`;

    constructor(private http: HttpClient) {}

    getRolePermissions(roleId: number | string): Observable<Result<ReadAppPermissionDto[]>> {
        return this.http.get<Result<ReadAppPermissionDto[]>>(`${this.apiUrl}/GetRolePermissions?roleId=${roleId}`);
    }

    updateRolePermission(permissions: ReadAppPermissionDto[]): Observable<Result<boolean>> {
        return this.http.post<Result<boolean>>(`${this.apiUrl}/UpdateRollePermission`, permissions);
    }
}
