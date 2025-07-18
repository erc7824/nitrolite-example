// filepath: src/lib/utils.ts
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { type Address } from 'viem';

export interface SessionKey {
    privateKey: `0x${string}`;
    address: Address;
}

// Session key management
const SESSION_KEY_STORAGE = 'nexus_session_key';

export const generateSessionKey = (): SessionKey => {
    const privateKey = generatePrivateKey();
    const account = privateKeyToAccount(privateKey);
    return { privateKey, address: account.address };
};

export const getStoredSessionKey = (): SessionKey | null => {
    try {
        const stored = localStorage.getItem(SESSION_KEY_STORAGE);
        if (!stored) return null;

        const parsed = JSON.parse(stored);
        if (!parsed.privateKey || !parsed.address) return null;

        return parsed as SessionKey;
    } catch {
        return null;
    }
};

export const storeSessionKey = (sessionKey: SessionKey): void => {
    try {
        localStorage.setItem(SESSION_KEY_STORAGE, JSON.stringify(sessionKey));
    } catch {
        // Storage failed - continue without caching
    }
};

export const removeSessionKey = (): void => {
    try {
        localStorage.removeItem(SESSION_KEY_STORAGE);
    } catch {
        // Removal failed - not critical
    }
};

// JWT helpers
const JWT_KEY = 'nexus_jwt_token';

export const getStoredJWT = (): string | null => {
    try {
        return localStorage.getItem(JWT_KEY);
    } catch {
        return null;
    }
};

export const storeJWT = (token: string): void => {
    try {
        localStorage.setItem(JWT_KEY, token);
    } catch {}
};

export const removeJWT = (): void => {
    try {
        localStorage.removeItem(JWT_KEY);
    } catch {}
};
