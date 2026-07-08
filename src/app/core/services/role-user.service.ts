import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IdentityRoleDto } from '../models/role.models';
import { BaseService } from '../base/base.service';

@Injectable({
    providedIn: 'root'
})
export class RoleUserService extends BaseService<IdentityRoleDto> {
    constructor(http: HttpClient) {
        // Full CRUD capability targeting api/RoleUserService
        super(http, 'RoleUserService');
    }
}
