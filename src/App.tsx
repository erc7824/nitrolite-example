import { useState, useEffect } from 'preact/hooks';
import { createWalletClient, custom, type Address, type WalletClient } from 'viem';
import { mainnet } from 'viem/chains';
// CHAPTER 3: Authentication imports
import {
    createAuthRequestMessage,
    createAuthVerifyMessage,
    createEIP712AuthMessageSigner,
    parseAnyRPCResponse,
    RPCMethod,
    type AuthChallengeResponse,
    type AuthRequestParams,
} from '@erc7824/nitrolite';
import { PostList } from './components/PostList/PostList';
import { posts } from './data/posts';
import { webSocketService, type WsStatus } from './lib/websocket';
// CHAPTER 3: Authentication utilities
import {
    generateSessionKey,
    getStoredSessionKey,
    storeSessionKey,
    removeSessionKey,
    storeJWT,
    removeJWT,
    type SessionKey,
} from './lib/utils';

declare global {
    interface Window {
        ethereum?: any;
    }
}

// CHAPTER 3: EIP-712 domain for Nexus authentication
const getAuthDomain = () => ({
    name: 'Nexus',
});

// CHAPTER 3: Authentication constants
const AUTH_SCOPE = 'nexus.app';
const APP_NAME = 'Nexus';
const SESSION_DURATION = 3600; // 1 hour

export function App() {
    const [account, setAccount] = useState<Address | null>(null);
    const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
    const [wsStatus, setWsStatus] = useState<WsStatus>('Disconnected');
    // CHAPTER 3: Authentication state
    const [sessionKey, setSessionKey] = useState<SessionKey | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthAttempted, setIsAuthAttempted] = useState(false);
    const [sessionExpireTimestamp, setSessionExpireTimestamp] = useState<string>('');

    useEffect(() => {
        // CHAPTER 3: Get or generate session key on startup (IMPORTANT: Store in localStorage)
        const existingSessionKey = getStoredSessionKey();
        if (existingSessionKey) {
            setSessionKey(existingSessionKey);
        } else {
            const newSessionKey = generateSessionKey();
            storeSessionKey(newSessionKey);
            setSessionKey(newSessionKey);
        }

        webSocketService.addStatusListener(setWsStatus);
        webSocketService.connect();

        return () => {
            webSocketService.removeStatusListener(setWsStatus);
        };
    }, []);

    // CHAPTER 3: Auto-trigger authentication when conditions are met
    useEffect(() => {
        if (account && sessionKey && wsStatus === 'Connected' && !isAuthenticated && !isAuthAttempted) {
            setIsAuthAttempted(true);

            // Generate fresh timestamp for this auth attempt
            const expireTimestamp = String(Math.floor(Date.now() / 1000) + SESSION_DURATION);
            setSessionExpireTimestamp(expireTimestamp);

            const authParams: AuthRequestParams = {
                address: account,
                session_key: sessionKey.address,
                app_name: APP_NAME,
                expire: expireTimestamp,
                scope: AUTH_SCOPE,
                application: account,
                allowances: [],
            };

            createAuthRequestMessage(authParams).then((payload) => {
                webSocketService.send(payload);
            });
        }
    }, [account, sessionKey, wsStatus, isAuthenticated, isAuthAttempted]);

    // CHAPTER 3: Handle server messages for authentication
    useEffect(() => {
        const handleMessage = async (data: any) => {
            const response = parseAnyRPCResponse(JSON.stringify(data));

            // Handle auth challenge
            if (
                response.method === RPCMethod.AuthChallenge &&
                walletClient &&
                sessionKey &&
                account &&
                sessionExpireTimestamp
            ) {
                const challengeResponse = response as AuthChallengeResponse;

                const authParams = {
                    scope: AUTH_SCOPE,
                    application: walletClient.account?.address as `0x${string}`,
                    participant: sessionKey.address as `0x${string}`,
                    expire: sessionExpireTimestamp,
                    allowances: [],
                };

                const eip712Signer = createEIP712AuthMessageSigner(walletClient, authParams, getAuthDomain());

                try {
                    const authVerifyPayload = await createAuthVerifyMessage(eip712Signer, challengeResponse);
                    webSocketService.send(authVerifyPayload);
                } catch (error) {
                    alert('Signature rejected. Please try again.');
                    setIsAuthAttempted(false);
                }
            }

            // Handle auth success
            if (response.method === RPCMethod.AuthVerify && response.params?.success) {
                setIsAuthenticated(true);
                if (response.params.jwtToken) storeJWT(response.params.jwtToken);
            }

            // Handle errors
            if (response.method === RPCMethod.Error) {
                removeJWT();
                // Clear session key on auth failure to regenerate next time
                removeSessionKey();
                alert(`Authentication failed: ${response.params.error}`);
                setIsAuthAttempted(false);
            }
        };

        webSocketService.addMessageListener(handleMessage);
        return () => webSocketService.removeMessageListener(handleMessage);
    }, [walletClient, sessionKey, sessionExpireTimestamp, account]);

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert('Please install MetaMask!');
            return;
        }

        const tempClient = createWalletClient({
            chain: mainnet,
            transport: custom(window.ethereum),
        });
        const [address] = await tempClient.requestAddresses();

        // CHAPTER 3: Create wallet client with account for EIP-712 signing
        const walletClient = createWalletClient({
            account: address,
            chain: mainnet,
            transport: custom(window.ethereum),
        });

        setWalletClient(walletClient);
        setAccount(address);
    };

    const formatAddress = (address: Address) => `${address.slice(0, 6)}...${address.slice(-4)}`;

    return (
        <div className="app-container">
            <header className="header">
                <div className="header-content">
                    <h1 className="logo">Nexus</h1>
                    <p className="tagline">Decentralized insights for the next generation of builders</p>
                </div>
                <div className="header-controls">
                    <div className={`ws-status ${wsStatus.toLowerCase()}`}>
                        <span className="status-dot"></span> {wsStatus}
                    </div>
                    <div className="wallet-connector">
                        {account ? (
                            <div className="wallet-info">Connected: {formatAddress(account)}</div>
                        ) : (
                            <button onClick={connectWallet} className="connect-button">
                                Connect Wallet
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="main-content">
                {/* CHAPTER 3: Pass authentication state to PostList */}
                <PostList posts={posts} isWalletConnected={!!account} isAuthenticated={isAuthenticated} />
            </main>
        </div>
    );
}
