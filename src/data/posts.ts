export interface Post {
    id: string;
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: string;
    type: 'Deep' | 'Quick';
}

export const posts: Post[] = [
    {
        id: '1',
        title: 'The Future of Web3 Development',
        content:
            'Exploring the latest trends and technologies shaping the decentralized web. From smart contracts to DeFi protocols, the landscape is evolving rapidly.',
        authorId: '1',
        authorName: 'Alice Johnson',
        createdAt: '2025-01-15T10:30:00Z',
        type: 'Deep',
    },
    {
        id: '2',
        title: 'Building User-Friendly dApps',
        content:
            "User experience is crucial for mainstream adoption of decentralized applications. Here's how to create intuitive interfaces for blockchain apps.",
        authorId: '2',
        authorName: 'Bob Smith',
        createdAt: '2025-01-14T14:20:00Z',
        type: 'Quick',
    },
    {
        id: '3',
        title: 'Understanding Smart Contract Security',
        content:
            'Security considerations are paramount when developing smart contracts. This guide covers best practices and common vulnerabilities to avoid.',
        authorId: '3',
        authorName: 'Charlie Davis',
        createdAt: '2025-01-13T09:15:00Z',
        type: 'Deep',
    },
    {
        id: '4',
        title: 'The Evolution of DeFi Protocols',
        content:
            "Decentralized finance has transformed the financial landscape. Let's explore how DeFi protocols are revolutionizing traditional finance.",
        authorId: '4',
        authorName: 'Diana Brown',
        createdAt: '2025-01-12T16:45:00Z',
        type: 'Quick',
    },
    {
        id: '5',
        title: 'Web3 Developer Tools and Frameworks',
        content:
            "The right tools can significantly improve your Web3 development experience. Here's a comprehensive guide to the best frameworks and libraries.",
        authorId: '1',
        authorName: 'Alice Johnson',
        createdAt: '2025-01-11T11:30:00Z',
        type: 'Deep',
    },
    {
        id: '6',
        title: 'NFT Marketplace Development',
        content:
            'Building a comprehensive NFT marketplace requires careful consideration of user experience, smart contract design, and scalability.',
        authorId: '2',
        authorName: 'Bob Smith',
        createdAt: '2025-01-10T08:20:00Z',
        type: 'Deep',
    },
    {
        id: '7',
        title: 'Layer 2 Solutions and Scaling',
        content:
            'Understanding the various Layer 2 solutions available for Ethereum and how they can help scale decentralized applications.',
        authorId: '3',
        authorName: 'Charlie Davis',
        createdAt: '2025-01-09T13:45:00Z',
        type: 'Quick',
    },
    {
        id: '8',
        title: 'Cross-Chain Interoperability',
        content:
            'Exploring the future of blockchain interoperability and how different networks can communicate and share value.',
        authorId: '4',
        authorName: 'Diana Brown',
        createdAt: '2025-01-08T12:30:00Z',
        type: 'Deep',
    },
    {
        id: '9',
        title: 'Decentralized Storage Solutions',
        content:
            'From IPFS to Arweave, learn about the various decentralized storage options available for Web3 applications.',
        authorId: '1',
        authorName: 'Alice Johnson',
        createdAt: '2025-01-07T15:10:00Z',
        type: 'Quick',
    },
    {
        id: '10',
        title: 'Web3 Gaming and Metaverse',
        content:
            'The convergence of blockchain technology and gaming is creating new possibilities for player ownership and virtual economies.',
        authorId: '5',
        authorName: 'Eve Wilson',
        createdAt: '2025-01-06T11:25:00Z',
        type: 'Deep',
    },
    {
        id: '11',
        title: 'DAO Governance and Tokenomics',
        content:
            'Understanding the principles of decentralized autonomous organizations and how to design effective governance mechanisms.',
        authorId: '6',
        authorName: 'Frank Miller',
        createdAt: '2025-01-05T14:40:00Z',
        type: 'Quick',
    },
    {
        id: '12',
        title: 'Privacy-Preserving Technologies',
        content:
            'Zero-knowledge proofs and other privacy technologies are becoming essential for protecting user data in Web3.',
        authorId: '2',
        authorName: 'Bob Smith',
        createdAt: '2025-01-04T09:15:00Z',
        type: 'Deep',
    },
    {
        id: '13',
        title: 'Sustainable Blockchain Development',
        content:
            'Exploring eco-friendly blockchain solutions and the move towards more sustainable consensus mechanisms.',
        authorId: '3',
        authorName: 'Charlie Davis',
        createdAt: '2025-01-03T16:50:00Z',
        type: 'Quick',
    },
    {
        id: '14',
        title: 'Real-World Asset Tokenization',
        content:
            'The process of converting physical assets into digital tokens on the blockchain opens new investment opportunities.',
        authorId: '4',
        authorName: 'Diana Brown',
        createdAt: '2025-01-02T10:35:00Z',
        type: 'Deep',
    },
    {
        id: '15',
        title: 'Web3 Identity and Authentication',
        content:
            'Self-sovereign identity solutions are reshaping how users control and share their personal information online.',
        authorId: '1',
        authorName: 'Alice Johnson',
        createdAt: '2025-01-01T12:20:00Z',
        type: 'Quick',
    },
    {
        id: '16',
        title: 'Decentralized Social Networks',
        content:
            'The rise of decentralized social platforms promises to give users more control over their data and content.',
        authorId: '5',
        authorName: 'Eve Wilson',
        createdAt: '2024-12-31T14:45:00Z',
        type: 'Deep',
    },
    {
        id: '17',
        title: 'Blockchain Analytics and Monitoring',
        content:
            'Tools and techniques for monitoring blockchain networks and analyzing transaction patterns for insights.',
        authorId: '6',
        authorName: 'Frank Miller',
        createdAt: '2024-12-30T11:30:00Z',
        type: 'Quick',
    },
    {
        id: '18',
        title: 'Regulatory Compliance in Web3',
        content: 'Navigating the evolving regulatory landscape for cryptocurrency and blockchain-based applications.',
        authorId: '2',
        authorName: 'Bob Smith',
        createdAt: '2024-12-29T13:15:00Z',
        type: 'Deep',
    },
    {
        id: '19',
        title: 'Blockchain Security Best Practices',
        content:
            'A comprehensive guide to securing blockchain applications and protecting against common attack vectors.',
        authorId: '3',
        authorName: 'Charlie Davis',
        createdAt: '2024-12-28T15:20:00Z',
        type: 'Quick',
    },
    {
        id: '20',
        title: 'The Future of Decentralized Finance',
        content: 'Exploring emerging trends in DeFi, from yield farming to synthetic assets and beyond.',
        authorId: '4',
        authorName: 'Diana Brown',
        createdAt: '2024-12-27T09:40:00Z',
        type: 'Deep',
    },
];
