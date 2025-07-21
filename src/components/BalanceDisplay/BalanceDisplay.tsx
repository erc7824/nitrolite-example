// CHAPTER 4: Balance display component
import styles from './BalanceDisplay.module.css';

interface BalanceDisplayProps {
    balance: string | null;
    symbol: string;
}

export function BalanceDisplay({ balance, symbol }: BalanceDisplayProps) {
    // CHAPTER 4: Format balance for display
    const formattedBalance = balance ? parseFloat(balance).toFixed(2) : '0.00';

    return (
        <div className={styles.balanceContainer}>
            <span className={styles.balanceAmount}>{formattedBalance}</span>
            <span className={styles.balanceSymbol}>{symbol}</span>
        </div>
    );
}
