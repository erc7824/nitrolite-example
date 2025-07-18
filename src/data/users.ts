export interface User {
    id: string;
    name: string;
    walletAddress: string;
}

export const users: User[] = [
    {
        id: '1',
        name: 'Alice Johnson',
        walletAddress: '0x742d35Cc6634C0532925a3b8D5c3e5De4a1234567',
    },
    {
        id: '2',
        name: 'Bob Smith',
        walletAddress: '0x742d35Cc6634C0532925a3b8D5c3e5De4a7654321',
    },
    {
        id: '3',
        name: 'Charlie Davis',
        walletAddress: '0x742d35Cc6634C0532925a3b8D5c3e5De4a9876543',
    },
    {
        id: '4',
        name: 'Diana Brown',
        walletAddress: '0x742d35Cc6634C0532925a3b8D5c3e5De4a1357924',
    },
    {
        id: '5',
        name: 'Eve Wilson',
        walletAddress: '0x742d35Cc6634C0532925a3b8D5c3e5De4a2468135',
    },
    {
        id: '6',
        name: 'Frank Miller',
        walletAddress: '0x742d35Cc6634C0532925a3b8D5c3e5De4a8642097',
    },
];
