class StorageService {
    static getLocalStorageItem(key: string) {
        return localStorage.getItem(key);
    }

    static setLocalStorageItem(key: string, value: string) {
        localStorage.setItem(key, value);
    }

    static removeLocalStorageItem(key: string) {
        localStorage.removeItem(key);
    }

    static clearLocalStorage() {
        localStorage.clear();
    }

    static getSessionStorageItem(key: string) {
        return sessionStorage.getItem(key);
    }

    static setSessionStorageItem(key: string, value: string) {
        sessionStorage.setItem(key, value);
    }

    static removeSessionStorageItem(key: string) {
        sessionStorage.removeItem(key);
    }

    static clearSessionStorage() {
        sessionStorage.clear();
    }

}

export default StorageService;