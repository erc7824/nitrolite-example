import { PostList } from './components/PostList/PostList';
import { posts } from './data/posts';

export function App() {
    return (
        <div className="app-container">
            <header className="header">
                <div className="header-content">
                    <h1 className="logo">Nexus</h1>
                    <p className="tagline">Decentralized insights for the next generation of builders</p>
                </div>
            </header>

            <main className="main-content">
                <PostList posts={posts} />
            </main>
        </div>
    );
}
