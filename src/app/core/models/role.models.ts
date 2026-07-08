export interface IdentityRoleDto {
    id?: number;
    name?: string;
    description?: string;
    isSystem?: boolean;
    isActive?: boolean;
}

export interface IdentityRoleAddDto {
    name?: string;
    description?: string;
    isSystem?: boolean;
    isActive?: boolean;
}

export interface IdentityRoleUpdateDto extends IdentityRoleDto {
    // Exactly matches IdentityRoleDto in C# wrapper logic
}
