import { type Post } from '../../data/posts';
import { users } from '../../data/users';
import styles from './PostList.module.css';

interface PostListProps {
    posts: Post[];
    isWalletConnected: boolean;
    isAuthenticated: boolean;
    onTransfer?: (recipient: string, amount: string) => Promise<void>;
    isTransferring?: boolean;
}

export function PostList({ posts, isWalletConnected, isAuthenticated, onTransfer, isTransferring }: PostListProps) {
    const handleTip = async (post: Post) => {
        if (!onTransfer) {
            console.log('Transfer function not available');
            return;
        }

        // Find the author's wallet address from users data
        const author = users.find(user => user.id === post.authorId);
        if (!author) {
            console.error('Author wallet address not found');
            return;
        }

        console.log(`Supporting ${post.authorName} with 0.01 USDC`);
        await onTransfer(author.walletAddress, '0.01');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'yesterday';
        if (diffDays <= 7) return `${diffDays} days ago`;
        if (diffDays <= 14) return `${Math.ceil(diffDays / 7)} week ago`;
        if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <section className={styles.container}>
            <div className={styles.grid}>
                {posts.map((post, index) => (
                    <article key={post.id} className={styles.card}>
                        <a href={`#post-${post.id}`} className={styles.cardLink}>
                            <span className={styles.showNumber}>{index + 1}</span>
                            <div className={styles.details}>
                                <p className={styles.date}>
                                    {post.type} <span>×</span>{' '}
                                    <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
                                </p>
                                <h4 className={styles.showTitle}>{post.title}</h4>
                                <p className={styles.description}>{post.content}</p>
                                <div className={styles.bottomRow}>
                                    <div className={styles.pile}>
                                        <div className={styles.avatar}>
                                            {post.authorName
                                                .split(' ')
                                                .map((name) => name[0])
                                                .join('')}
                                        </div>
                                    </div>
                                    <div className={styles.buttons}>
                                        <button
                                            className={styles.supportButton}
                                            disabled={!isWalletConnected || !isAuthenticated || isTransferring}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleTip(post);
                                            }}
                                        >
                                            {!isWalletConnected
                                                ? 'Connect Wallet'
                                                : !isAuthenticated
                                                  ? 'Authenticating...'
                                                  : isTransferring
                                                    ? 'Supporting...'
                                                    : 'Support 0.01 USDC'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </article>
                ))}
            </div>
        </section>
    );
}
