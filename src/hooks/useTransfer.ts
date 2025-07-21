// FINAL: Custom hook for handling transfers
import { useCallback } from 'preact/hooks';
import { createTransferMessage, createECDSAMessageSigner } from '@erc7824/nitrolite';
import type { Address } from 'viem';
import { webSocketService } from '../lib/websocket';
import type { SessionKey } from '../lib/utils';

export interface TransferResult {
    success: boolean;
    error?: string;
}

export const useTransfer = (sessionKey: SessionKey | null, isAuthenticated: boolean) => {
    const handleTransfer = useCallback(
        async (recipient: Address, amount: string, asset: string = 'usdc'): Promise<TransferResult> => {
            if (!isAuthenticated || !sessionKey) {
                return { success: false, error: 'Please authenticate first' };
            }

            try {
                const sessionSigner = createECDSAMessageSigner(sessionKey.privateKey);

                const transferPayload = await createTransferMessage(sessionSigner, {
                    destination: recipient,
                    allocations: [
                        {
                            asset: asset.toLowerCase(),
                            amount: amount,
                        }
                    ],
                });

                console.log('Sending transfer request...');
                webSocketService.send(transferPayload);
                
                return { success: true };
            } catch (error) {
                console.error('Failed to create transfer:', error);
                const errorMsg = error instanceof Error ? error.message : 'Failed to create transfer';
                return { success: false, error: errorMsg };
            }
        },
        [sessionKey, isAuthenticated]
    );

    return { handleTransfer };
};