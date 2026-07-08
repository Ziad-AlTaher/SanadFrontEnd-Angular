export interface AuthDto {
    token: string;
    refreshToken: string;
    expiration: string;
    // Add other user claims returned by the AuthDto payload if required, e.g.:
    id?: number;
    userName?: string;
    email?: string;
    roles?: string[];
}

export interface LogInDto {
    email?: string;
    phoneNumber?: string;
    password?: string;
}

export interface RegisterDto {
    sendToEmail?: boolean;
    sendToSms?: boolean;
    isActive?: boolean;
    firstName: string;
    middleName?: string;
    lastName: string;
    nationalId?: string;
    nationalityId?: number;
    userName?: string;
    address?: string;
    phone?: string;
    phoneNumberCountryId?: number;
    email?: string;
    password?: string;
    confirmPassword?: string;
    dateOfBirth?: string | Date;
}

export interface InitializeOTPDto {
    identity: string; // Email or Phone Number depending on context
}

export interface ConfirmAuthenticationOTPDto {
    identity: string;
    otp: string;
}

export interface ResetPasswordResponseDto {
    token: string;
}

export interface ResetPasswordDto {
    identity: string; // Can be email or phone
    token: string; // the token received from OTP check
    newPassword: string;
}
