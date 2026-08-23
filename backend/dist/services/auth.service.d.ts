export declare class AuthService {
    register(email: string, password: string, name?: string): Promise<{
        user: any;
        token: string;
    }>;
    login(email: string, password: string): Promise<{
        user: any;
        token: string;
    }>;
    getMe(userId: string): Promise<any>;
    updateProfile(userId: string, data: {
        name?: string;
        currentPassword?: string;
        newPassword?: string;
    }): Promise<any>;
    updateUserProfile(userId: string, profileData: any): Promise<any>;
    getUserProfile(userId: string): Promise<any>;
    private generateToken;
    private sanitizeUser;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map