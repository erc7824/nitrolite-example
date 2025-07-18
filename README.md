# Nitrolite-Example

This project demonstrates how to build high-throughput, low-latency Web3 applications.

The core goal is to show how to use `@erc7824/nitrolite`, a state channel framework for EVM chains, to enable off-chain interactions with on-chain security. This allows you to build a user experience with instant finality that feels as responsive as a traditional Web2 application.

## Workshop Goal

In this workshop, we will use a sample content platform application as a practical example. We will walk through the process of integrating Nitrolite to enable features like instant microtransactions. The principles you learn here can be applied to any dApp to significantly improve user experience by removing transaction friction.

## Technology Stack

- **Framework:** Preact with Hooks
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** CSS Modules
- **Key Library:** `@erc7824/nitrolite`

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- A WebSocket RPC endpoint for Nitrolite.

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone <your-repo-url>
    cd nitrolite-example
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a file named `.env.local` in the root of the project and add your Nitrolite WebSocket URL:

    ```env
    # .env.local
    VITE_NITROLITE_WS_URL=wss://your-rpc-endpoint.com/ws
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (or the next available port).

## Workshop Chapters

This repository uses branches to guide you through the workshop. You can switch between branches to see the code evolve at each stage.

- `main`: The initial project setup.
- `chapter-1-wallet-connect`: Solution for Chapter 1 (Connecting to a user's wallet).
- `chapter-2-ws-connection`: Solution for Chapter 2 (Initializing the WebSocket connection).
- `chapter-3-session-auth`: Solution for Chapter 3 (Authenticating the session via WebSocket).
- `chapter-4-display-balances`: Solution for Chapter 4 (Fetching and displaying asset balances).
- `final-p2p-transfer`: The final, completed application with peer-to-peer transfers.

## Note for Presenters

A special `presenter` branch is available for conducting the live workshop.

This branch contains the final, completed code, but the logic for **Chapter 3 onwards** is commented out in sequential blocks. To present, stay on this branch and uncomment each block as you progress through the workshop. This ensures a smooth, typo-free demonstration. The `chapter-*` branches serve as clean checkpoints for attendees.
