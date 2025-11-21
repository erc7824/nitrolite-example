// CHAPTER 5: Custom hook for creating application sessions
import { useCallback } from 'preact/hooks';
import {
    createAppSessionMessage,
    RPCAppDefinition,
    RPCAppSessionAllocation,
    createECDSAMessageSigner,
} from '@erc7824/nitrolite';
import type { Hex } from 'viem';
import { webSocketService } from '../lib/websocket';
import type { SessionKey } from '../lib/utils';

export interface CreateAppSessionResult {
    success: boolean;
    appSessionId?: string;
    error?: string;
}

export interface AppSessionConfig {
    from: string; // Participant A - the one allocating funds
    to: string; // Participant B - the recipient
    amount: string; // Amount to allocate from A
    sessionData?: string; // JSON string containing game/app-specific data
    application?: string; // Application identifier (defaults to 'clearnode')
    challenge?: number; // Challenge period in seconds (defaults to 0)
}

const DEFAULT_PROTOCOL = 'NitroRPC/0.4';
const DEFAULT_WEIGHTS = [100, 0];
const DEFAULT_QUORUM = 100;
const DEFAULT_APPLICATION = 'clearnode';

export const useCreateAppSession = (sessionKey: SessionKey | null, isAuthenticated: boolean) => {
    const createAppSession = useCallback(
        async (config: AppSessionConfig): Promise<CreateAppSessionResult> => {
            if (!isAuthenticated || !sessionKey) {
                return { success: false, error: 'Please authenticate first' };
            }

            try {
                const {
                    from,
                    to,
                    amount,
                    sessionData,
                    application = DEFAULT_APPLICATION,
                    challenge = 0,
                } = config;

                // Create app definition
                const appDefinition: RPCAppDefinition = {
                    application,
                    protocol: DEFAULT_PROTOCOL,
                    participants: [from, to] as Hex[],
                    weights: DEFAULT_WEIGHTS,
                    quorum: DEFAULT_QUORUM,
                    challenge,
                    nonce: Date.now(),
                };

                // Create allocations: A puts in funds, B puts in 0
                const allocations: RPCAppSessionAllocation[] = [
                    {
                        participant: from as Hex,
                        asset: 'usdc',
                        amount: amount,
                    },
                    {
                        participant: to as Hex,
                        asset: 'usdc',
                        amount: '0',
                    },
                ];

                // Create session signer
                const sessionSigner = createECDSAMessageSigner(sessionKey.privateKey);

                // Create signed message with session_data if provided
                const signedMessage = await createAppSessionMessage(sessionSigner, {
                    definition: appDefinition,
                    allocations,
                    ...(sessionData && { session_data: sessionData }),
                });

                console.log('Sending create app session request...');
                webSocketService.send(signedMessage);

                return { success: true };
            } catch (error) {
                console.error('Failed to create app session:', error);
                const errorMsg = error instanceof Error ? error.message : 'Failed to create app session';
                return { success: false, error: errorMsg };
            }
        },
        [sessionKey, isAuthenticated]
    );

    return { createAppSession };
};
