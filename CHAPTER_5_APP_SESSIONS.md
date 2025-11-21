# Chapter 5: App Sessions

This chapter replaces the transfer functionality with app sessions, demonstrating how to use the Nitrolite protocol to create stateful application sessions.

## What Changed

Instead of using simple transfers, we now use **app sessions** which:
1. **Create**: User (A) allocates funds into a session
2. **Close**: Funds are immediately moved to recipient (B)

This showcases how app sessions work as a two-step process, executed automatically in sequence.

## Implementation

### 1. Hooks

#### `useCreateAppSession` (`src/hooks/useCreateAppSession.ts`)
Creates an app session with:
- `from`: The user's wallet (participant A) - allocates the funds
- `to`: The recipient (participant B) - receives 0 initially
- `amount`: Amount to lock in the session
- `sessionData`: Optional JSON string with app-specific data

**Key Detail**: On create, participant A puts in the funds, participant B puts in 0.

#### `useCloseAppSession` (`src/hooks/useCloseAppSession.ts`)
Closes an app session with final allocations:
- Takes `appSessionId` and final `allocations` array
- Optional `sessionData` parameter for close state
- Redistributes funds according to the allocations

**Key Detail**: On close, we send all funds to participant B (amount: sessionAmount) and A gets 0. Session data can include completion status, final state, etc.

### 2. User Flow

#### When user clicks "Support" button:
1. **Create App Session**:
   - Creates app session with user as participant A
   - Allocates the support amount from user's balance
   - Includes session_data: `{type: 'support', recipient, amount, timestamp}`
   - Shows: "Sending support..."

2. **Immediately Close Session** (automatic):
   - Upon receiving session ID, automatically closes the session
   - Moves all funds to the recipient (participant B)
   - Includes session_data: `{type: 'support_complete', recipient, amount, timestamp, completed: true}`
   - Shows: "Support sent!"

The entire flow happens in one click, but demonstrates the two-step app session protocol (create → close) with session data on both steps.

### 3. State Management

App state includes:
- `appSessionId`: Temporarily stores session ID between create and close
- `sessionRecipient`: Who will receive the funds on close
- `sessionAmount`: How much to send on close
- `isCreatingSession`: Loading state for creation
- `isClosingSession`: Loading state for closure
- `appSessionStatus`: User feedback message ("Sending support..." → "Support sent!")

Session data is only held in memory during the create→close sequence and is cleared immediately after.

### 4. API Structure

#### Create App Session
```json
{
  "definition": {
    "application": "clearnode",
    "protocol": "NitroRPC/0.2",
    "participants": ["0xUserAddress", "0xRecipientAddress"],
    "weights": [50, 50],
    "quorum": 100,
    "challenge": 0,
    "nonce": 1234567890
  },
  "allocations": [
    { "participant": "0xUserAddress", "asset": "usdc", "amount": "5.0" },
    { "participant": "0xRecipientAddress", "asset": "usdc", "amount": "0" }
  ],
  "session_data": "{\"type\":\"support\",\"recipient\":\"0x...\",\"amount\":\"5.0\",\"timestamp\":1234567890}"
}
```

#### Close App Session
```json
{
  "app_session_id": "0x...",
  "allocations": [
    { "participant": "0xUserAddress", "asset": "usdc", "amount": "0" },
    { "participant": "0xRecipientAddress", "asset": "usdc", "amount": "5.0" }
  ],
  "session_data": "{\"type\":\"support_complete\",\"recipient\":\"0x...\",\"amount\":\"5.0\",\"timestamp\":1234567890,\"completed\":true}"
}
```

### 5. Key Differences from Transfer

| Transfer | App Session |
|----------|-------------|
| One RPC call | Two RPC calls (create → close) |
| Single protocol message | Two protocol messages in sequence |
| Simple send | Can include custom session data |
| No state | Stateful with session ID (temporary) |
| Direct | Demonstrates two-phase commit pattern |

**Note**: In this demo, both steps happen automatically on one click to showcase the protocol while maintaining a simple UX.

### 6. UI/UX

The UI remains the same as the transfer version:
- PostList with "Support" buttons
- Status message showing current operation
- Buttons disabled during operations
- Same styling and layout

**User Experience**:
- Single click: Creates session and immediately closes it, completing the support
- Status messages: "Sending support..." → "Support sent!"
- Seamless UX that feels like a direct transfer

## Testing

1. Start the dev server: `npm run dev`
2. Connect wallet and authenticate
3. Click "Support" on any post
4. Watch the flow: create session → immediately close → funds transferred
5. Check balance updates in real-time

## Benefits of App Sessions

- **Stateful**: Can track ongoing games, escrows, etc.
- **Flexible**: Session data can store game state, rules, etc.
- **Two-phase commits**: Funds locked until close
- **Custom logic**: Allocations can be determined by app logic before close

## Example Use Cases

- **Games**: Lock entry fees, distribute based on winner
- **Escrows**: Hold funds until conditions met
- **Tournaments**: Collect buy-ins, distribute prizes
- **Subscriptions**: Lock payment, release based on usage
