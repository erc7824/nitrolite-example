// CHAPTER 5: Custom hook for closing application sessions
import { useCallback } from 'preact/hooks';
import {
    createCloseAppSessionMessage,
    AccountID,
    CloseAppSessionRequestParams,
    RPCAppSessionAllocation,
    createECDSAMessageSigner,
} from '@erc7824/nitrolite';
import { webSocketService } from '../lib/websocket';
import type { SessionKey } from '../lib/utils';

export interface CloseAppSessionResult {
    success: boolean;
    error?: string;
}

export const useCloseAppSession = (sessionKey: SessionKey | null, isAuthenticated: boolean) => {
    const closeAppSession = useCallback(
        async (
            appSessionId: AccountID,
            finalAllocations: RPCAppSessionAllocation[],
            sessionData?: string
        ): Promise<CloseAppSessionResult> => {
            if (!isAuthenticated || !sessionKey) {
                return { success: false, error: 'Please authenticate first' };
            }

            if (!appSessionId) {
                return { success: false, error: 'Application session ID is required' };
            }

            if (!finalAllocations || finalAllocations.length === 0) {
                return { success: false, error: 'Final allocations are required' };
            }

            try {
                // Create session signer
                const sessionSigner = createECDSAMessageSigner(sessionKey.privateKey);

                // Create close request
                const closeRequest: CloseAppSessionRequestParams = {
                    app_session_id: appSessionId,
                    allocations: finalAllocations,
                    ...(sessionData && { session_data: sessionData }),
                };

                // Create signed message
                const signedMessage = await createCloseAppSessionMessage(sessionSigner, closeRequest);

                console.log('Sending close app session request...');
                webSocketService.send(signedMessage);

                return { success: true };
            } catch (error) {
                console.error('Failed to close app session:', error);
                const errorMsg = error instanceof Error ? error.message : 'Failed to close app session';
                return { success: false, error: errorMsg };
            }
        },
        [sessionKey, isAuthenticated]
    );

    return { closeAppSession };
};
