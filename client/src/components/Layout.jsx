import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

const Layout = () => {
    return (
        <div className="min-h-screen bg-slate-950">
            {/* Animated Background Mesh */}
            <div className="fixed inset-0 gradient-mesh pointer-events-none" />

            {/* Main Navigation (includes Top Bar and Sidebar) */}
            <Navbar />

            {/* Main Content Area */}
            <main className="lg:ml-64 transition-all duration-300">
                <div className="p-4 sm:p-6 lg:p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Outlet />
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
