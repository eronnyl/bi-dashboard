import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout({ children }) {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-panel">
                <Topbar />
                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
