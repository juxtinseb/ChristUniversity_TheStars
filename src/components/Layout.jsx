import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import AuthModal from './AuthModal';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
    const { showAuthModal, setShowAuthModal } = useAuth();

    return (
        <>
            <Navbar />
            <main style={{ paddingTop: 'var(--navbar-height)', minHeight: '100vh' }}>
                <Outlet />
            </main>
            <Footer />
            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
        </>
    );
}
