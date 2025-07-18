import { useState, useEffect } from 'preact/hooks';
import { createWalletClient, custom, type Address, type WalletClient } from 'viem';
import { mainnet } from 'viem/chains';
import { PostList } from './components/PostList/PostList';
import { posts } from './data/posts';
import { webSocketService, type WsStatus } from './lib/websocket';

declare global {
    interface Window {
        ethereum?: any;
    }
}

export function App() {
    const [account, setAccount] = useState<Address | null>(null);
    const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
    const [wsStatus, setWsStatus] = useState<WsStatus>('Disconnected');

    useEffect(() => {
        webSocketService.addStatusListener(setWsStatus);
        webSocketService.connect();

        return () => {
            webSocketService.removeStatusListener(setWsStatus);
        };
    }, []);

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert('Please install MetaMask!');
            return;
        }
        const client = createWalletClient({
            chain: mainnet,
            transport: custom(window.ethereum),
        });
        const [address] = await client.requestAddresses();
        setWalletClient(client);
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
                <PostList posts={posts} isWalletConnected={!!account} />
            </main>
        </div>
    );
}
