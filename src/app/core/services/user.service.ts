import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Result } from '../models/api-response.model';
import { 
    GetUserDto, 
    ClientProfile, 
    UpdateUserDto, 
    AddUserDto 
} from '../models/user.model';
import { BaseService } from '../base/base.service';

@Injectable({
    providedIn: 'root'
})
export class UserService extends BaseService<GetUserDto> {
    
    constructor(http: HttpClient) {
        // Initializes base CRUD methods targeting api/UserService
        super(http, 'UserService');
    }

    updateUserStatus(id: number | string): Observable<Result<boolean>> {
        return this.http.put<Result<boolean>>(`${this.apiUrl}/${this.endpoint}/UpdateUserStatus?Id=${id}`, {});
    }

    getUserProfile(): Observable<Result<GetUserDto>> {
        return this.http.get<Result<GetUserDto>>(`${this.apiUrl}/${this.endpoint}/GetUserProfile`);
    }

    getClientUserProfile(): Observable<Result<ClientProfile>> {
        return this.http.get<Result<ClientProfile>>(`${this.apiUrl}/${this.endpoint}/ClientUserProfile`);
    }

    updateUserProfile(formData: FormData): Observable<Result<boolean>> {
        // Backend expects FormData containing fields and an image
        return this.http.post<Result<boolean>>(`${this.apiUrl}/${this.endpoint}/UpdateUserProfile`, formData);
    }

    updateClientUserProfile(formData: FormData): Observable<Result<UpdateUserDto>> {
        return this.http.post<Result<UpdateUserDto>>(`${this.apiUrl}/${this.endpoint}/UpdateClientUserProfile`, formData);
    }

    addUserRole(userId: number | string, roleName: string): Observable<Result<boolean>> {
        return this.http.post<Result<boolean>>(`${this.apiUrl}/${this.endpoint}/AddUserRole?userId=${userId}&role=${roleName}`, {});
    }

    deleteUserRole(userId: number | string, roleName: string): Observable<Result<boolean>> {
        return this.http.delete<Result<boolean>>(`${this.apiUrl}/${this.endpoint}/DeleteUserRole?userId=${userId}&role=${roleName}`);
    }

    resetPasswordAndSendSms(userId: number | string): Observable<Result<boolean>> {
        return this.http.put<Result<boolean>>(`${this.apiUrl}/${this.endpoint}/Reset-Password-And-SendSms?userId=${userId}`, {});
    }
}
