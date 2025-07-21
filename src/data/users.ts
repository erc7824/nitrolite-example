export interface User {
    id: string;
    name: string;
    walletAddress: string;
}

export const users: User[] = [
    {
        id: '1',
        name: 'Alice Johnson',
        walletAddress: '0xE03faB973fA4f1E48fb89410ec70B7c49eBE97D3',
    },
    {
        id: '2',
        name: 'Bob Smith',
        walletAddress: '0xE03faB973fA4f1E48fb89410ec70B7c49eBE97D3',
    },
    {
        id: '3',
        name: 'Charlie Davis',
        walletAddress: '0xE03faB973fA4f1E48fb89410ec70B7c49eBE97D3',
    },
    {
        id: '4',
        name: 'Diana Brown',
        walletAddress: '0xE03faB973fA4f1E48fb89410ec70B7c49eBE97D3',
    },
    {
        id: '5',
        name: 'Eve Wilson',
        walletAddress: '0xE03faB973fA4f1E48fb89410ec70B7c49eBE97D3',
    },
    {
        id: '6',
        name: 'Frank Miller',
        walletAddress: '0xE03faB973fA4f1E48fb89410ec70B7c49eBE97D3',
    },
];
