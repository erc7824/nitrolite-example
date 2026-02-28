import { useState, useEffect, useCallback, useRef, useMemo } from 'preact/hooks';
import { createWalletClient, custom, type Address, type WalletClient, parseUnits } from 'viem';
import { sepolia } from 'viem/chains';
import { NitroliteClient, EventPoller, type EventPollerCallbacks, type ClearNodeAsset } from '@erc7824/nitrolite-compat';
import { PostList } from './components/PostList/PostList';
import { BalanceDisplay } from './components/BalanceDisplay/BalanceDisplay';
import { posts } from './data/posts';

declare global {
    interface Window {
        ethereum?: {
            request: (args: { method: string; params?: any[] }) => Promise<any>;
            on?: (event: string, handler: (...args: any[]) => void) => void;
            removeListener?: (event: string, handler: (...args: any[]) => void) => void;
            isMetaMask?: boolean;
        };
    }
}

const WS_URL = import.meta.env.VITE_NITROLITE_WS_URL || 'wss://clearnode-v1-rc.yellow.org/ws';
const CHAIN_ID = Number(import.meta.env.VITE_CHAIN_ID || '11155111');
const USER_REJECTED_REQUEST_CODE = 4001;
const SUPPORTED_ASSETS = ['usdc', 'weth'] as const;
type SupportedAsset = typeof SUPPORTED_ASSETS[number];

const DEFAULT_ASSET_DECIMALS: Record<SupportedAsset, number> = {
    usdc: 6,
    weth: 18,
};

export function App() {
    const [account, setAccount] = useState<Address | null>(null);
    const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
    const [client, setClient] = useState<NitroliteClient | null>(null);
    const [isConnectingWallet, setIsConnectingWallet] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<SupportedAsset>('usdc');
    const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
    const [balances, setBalances] = useState<Record<string, string>>({});
    const [assets, setAssets] = useState<ClearNodeAsset[]>([]);
    const [isTransferring, setIsTransferring] = useState(false);
    const [transferStatus, setTransferStatus] = useState<string | null>(null);
    const pollerRef = useRef<EventPoller | null>(null);
    const clientRef = useRef<NitroliteClient | null>(null);

    const stopNitroliteSession = useCallback(() => {
        pollerRef.current?.stop();
        pollerRef.current = null;
        clientRef.current?.close();
        clientRef.current = null;
        setClient(null);
        setStatus('disconnected');
        setBalances({});
        setAssets([]);
    }, []);

    const ensureSepoliaNetwork = useCallback(async () => {
        if (!window.ethereum) return;

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${sepolia.id.toString(16)}` }],
            });
        } catch (switchErr: any) {
            if (switchErr.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: `0x${sepolia.id.toString(16)}`,
                        chainName: sepolia.name,
                        rpcUrls: [sepolia.rpcUrls.default.http[0]],
                    }],
                });
                return;
            }
            throw switchErr;
        }
    }, []);

    const revokeEthAccountsPermission = useCallback(async () => {
        if (!window.ethereum) return;

        try {
            await window.ethereum.request({
                method: 'wallet_revokePermissions',
                params: [{ eth_accounts: {} }],
            });
        } catch {
            // MetaMask versions < 11.5 may not support wallet_revokePermissions.
        }
    }, []);

    const connectWallet = useCallback(async () => {
        if (!window.ethereum) {
            alert('MetaMask not found!');
            return;
        }

        setIsConnectingWallet(true);

        try {
            const authorizedAccounts = await window.ethereum.request({ method: 'eth_accounts' }) as Address[];
            if (authorizedAccounts.length > 0) {
                await revokeEthAccountsPermission();
            }

            try {
                await window.ethereum.request({
                    method: 'wallet_requestPermissions',
                    params: [{ eth_accounts: {} }],
                });
            } catch (permissionError: any) {
                if (permissionError?.code !== USER_REJECTED_REQUEST_CODE) {
                    console.warn('wallet_requestPermissions failed, falling back to eth_requestAccounts:', permissionError);
                } else {
                    throw permissionError;
                }
            }

            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as Address[];
            if (!accounts || accounts.length === 0) {
                alert('No wallet address found.');
                return;
            }

            await ensureSepoliaNetwork();

            const wc = createWalletClient({
                account: accounts[0],
                chain: sepolia,
                transport: custom(window.ethereum),
            });

            stopNitroliteSession();
            setAccount(accounts[0]);
            setWalletClient(wc);
        } catch (error: any) {
            console.error('Wallet connection failed:', error);
            if (error?.code === USER_REJECTED_REQUEST_CODE) {
                alert('Wallet connection request was rejected.');
            } else {
                alert('Failed to connect wallet.');
            }
        } finally {
            setIsConnectingWallet(false);
        }
    }, [ensureSepoliaNetwork, revokeEthAccountsPermission, stopNitroliteSession]);

    const disconnectWallet = useCallback(async () => {
        stopNitroliteSession();
        setWalletClient(null);
        setAccount(null);
        await revokeEthAccountsPermission();
    }, [revokeEthAccountsPermission, stopNitroliteSession]);

    useEffect(() => {
        if (!walletClient || !account) return;

        let cancelled = false;
        let nitroClient: NitroliteClient | null = null;

        (async () => {
            setStatus('connecting');
            try {
                const blockchainRPCs: Record<number, string> = {};
                if (sepolia.rpcUrls?.default?.http?.[0]) {
                    blockchainRPCs[sepolia.id] = sepolia.rpcUrls.default.http[0];
                }

                nitroClient = await NitroliteClient.create({
                    wsURL: WS_URL,
                    walletClient: walletClient as any,
                    chainId: CHAIN_ID,
                    blockchainRPCs,
                });

                if (cancelled) {
                    nitroClient.close();
                    return;
                }

                setClient(nitroClient);
                clientRef.current = nitroClient;
                setStatus('connected');
                console.log('NitroliteClient connected for Nexus');

                const callbacks: EventPollerCallbacks = {
                    onBalanceUpdate: (balanceList) => {
                        const map: Record<string, string> = {};
                        for (const b of balanceList) {
                            map[b.asset] = b.amount;
                        }
                        setBalances(map);
                    },
                    onAssetsUpdate: (assetList) => {
                        setAssets(assetList);
                    },
                    onError: (err) => {
                        console.warn('[Nexus poller] error:', err.message);
                    },
                };

                const poller = new EventPoller(nitroClient, callbacks, 10000);
                poller.start();
                pollerRef.current = poller;
            } catch (err) {
                if (!cancelled) {
                    console.error('Failed to create NitroliteClient:', err);
                    setStatus('disconnected');
                }
            }
        })();

        return () => {
            cancelled = true;
            pollerRef.current?.stop();
            pollerRef.current = null;
            if (nitroClient && clientRef.current === nitroClient) {
                nitroClient.close();
                clientRef.current = null;
                setClient(null);
            }
        };
    }, [walletClient, account]);

    useEffect(() => {
        if (!window.ethereum) return;

        const handleAccountsChanged = (accounts: string[]) => {
            if (!accounts || accounts.length === 0) {
                stopNitroliteSession();
                setWalletClient(null);
                setAccount(null);
                return;
            }

            const nextAccount = accounts[0] as Address;
            setAccount(nextAccount);
            setWalletClient(createWalletClient({
                account: nextAccount,
                chain: sepolia,
                transport: custom(window.ethereum!),
            }));
        };

        const handleChainChanged = () => {
            window.location.reload();
        };

        window.ethereum.on?.('accountsChanged', handleAccountsChanged);
        window.ethereum.on?.('chainChanged', handleChainChanged);

        return () => {
            window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged);
            window.ethereum?.removeListener?.('chainChanged', handleChainChanged);
        };
    }, [stopNitroliteSession]);

    const selectableAssets = useMemo(() => {
        const availableAssets = new Set<string>();
        for (const balanceAsset of Object.keys(balances)) {
            availableAssets.add(balanceAsset.toLowerCase());
        }
        for (const asset of assets) {
            availableAssets.add(asset.symbol.toLowerCase());
        }

        const filteredAssets = SUPPORTED_ASSETS.filter((asset) => availableAssets.has(asset));
        return filteredAssets.length > 0 ? filteredAssets : [...SUPPORTED_ASSETS];
    }, [balances, assets]);

    useEffect(() => {
        if (!selectableAssets.includes(selectedAsset)) {
            setSelectedAsset(selectableAssets[0]);
        }
    }, [selectableAssets, selectedAsset]);

    const getDecimals = useCallback((asset: string): number => {
        const info = assets.find((a) => a.symbol.toLowerCase() === asset.toLowerCase());
        if (info?.decimals !== undefined) {
            return info.decimals;
        }

        const fallbackDecimals = DEFAULT_ASSET_DECIMALS[asset.toLowerCase() as SupportedAsset];
        return fallbackDecimals ?? 6;
    }, [assets]);

    const getRawBalance = useCallback((asset: string): string => {
        const normalizedAsset = asset.toLowerCase();
        const directBalance = balances[normalizedAsset] ?? balances[asset];
        if (directBalance !== undefined) {
            return directBalance;
        }

        const caseInsensitiveEntry = Object.entries(balances).find(([key]) => key.toLowerCase() === normalizedAsset);
        return caseInsensitiveEntry?.[1] ?? '0';
    }, [balances]);

    const formatBalance = useCallback((rawAmount: string, asset: string): string => {
        if (!rawAmount || rawAmount === '0') return '0.00';
        const decimals = getDecimals(asset);
        const num = Number(rawAmount) / Math.pow(10, decimals);
        return num.toFixed(2);
    }, [getDecimals]);

    const handleSupport = useCallback(async (recipient: string, amount: string) => {
        if (!client) {
            alert('Not connected');
            return;
        }

        setIsTransferring(true);
        setTransferStatus(`Sending ${amount} ${selectedAsset.toUpperCase()} support...`);

        try {
            const asset = selectedAsset;
            const decimals = getDecimals(asset);
            const rawAmount = parseUnits(amount, decimals).toString();

            await client.transfer(recipient as Address, [{ asset, amount: rawAmount }]);

            setTransferStatus(`Support sent in ${selectedAsset.toUpperCase()}!`);
            setTimeout(() => setTransferStatus(null), 3000);
        } catch (error) {
            console.error('Transfer failed:', error);
            const msg = error instanceof Error ? error.message : 'Transfer failed';
            alert(`Transfer failed: ${msg}`);
            setTransferStatus(null);
        } finally {
            setIsTransferring(false);
        }
    }, [client, getDecimals, selectedAsset]);

    const formatAddress = (address: Address) => `${address.slice(0, 6)}...${address.slice(-4)}`;

    const statusClass = status === 'connected' ? 'connected' : 'disconnected';

    return (
        <div className="app-container">
            <header className="header">
                <div className="header-controls">
                    {status !== 'disconnected' && (
                        <>
                            <BalanceDisplay
                                balance={formatBalance(getRawBalance(selectedAsset), selectedAsset)}
                                symbol={selectedAsset.toUpperCase()}
                            />
                            <select
                                className="asset-selector"
                                value={selectedAsset}
                                onChange={(event) => setSelectedAsset((event.target as HTMLSelectElement).value as SupportedAsset)}
                                disabled={isTransferring}
                            >
                                {selectableAssets.map((asset) => (
                                    <option key={asset} value={asset}>
                                        {asset.toUpperCase()}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}
                    <div className={`ws-status ${statusClass}`}>
                        <div className="status-dot" />
                        <span>{status === 'connected' ? 'Connected' : status === 'connecting' ? 'Connecting' : 'Disconnected'}</span>
                    </div>
                    {account ? (
                        <>
                            <span className="ws-status">{formatAddress(account)}</span>
                            <button className="wallet-connector" onClick={disconnectWallet}>
                                Disconnect
                            </button>
                        </>
                    ) : (
                        <button className="wallet-connector" onClick={connectWallet} disabled={isConnectingWallet}>
                            {isConnectingWallet ? 'Connecting...' : 'Connect Wallet'}
                        </button>
                    )}
                </div>
                <div className="header-content">
                    <h1 className="logo">Nexus</h1>
                    <p className="tagline">Decentralized insights for the next generation of builders</p>
                </div>
            </header>

            <main className="main-content">
                {transferStatus && <div className="transfer-status">{transferStatus}</div>}
                <PostList
                    posts={posts}
                    isWalletConnected={!!account}
                    isAuthenticated={status === 'connected'}
                    onTransfer={handleSupport}
                    isTransferring={isTransferring}
                    selectedAsset={selectedAsset}
                />
            </main>
        </div>
    );
}
