import StorageService from "./storage.service";

class JwtService {

    static getAccessToken() {
        return StorageService.getLocalStorageItem('accessToken');
    }

    static getRefreshToken() {
        return StorageService.getLocalStorageItem('refreshToken');
    }

    static setAccessToken(access_token: string) {
        StorageService.setLocalStorageItem('accessToken', access_token);
    }

    static setRefreshToken(refresh_token: string) {
        StorageService.setLocalStorageItem('refreshToken', refresh_token);
    }

    static removeAccessToken() {
        StorageService.removeLocalStorageItem('accessToken');
    }

    static removeRefreshToken() {
        StorageService.removeLocalStorageItem('refreshToken');
    }

    static clearAllTokens() {
        StorageService.removeLocalStorageItem('accessToken');
        StorageService.removeLocalStorageItem('refreshToken');
    }
}

export default JwtService;