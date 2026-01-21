import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, User, LogOut, Dumbbell, LayoutDashboard, BrainCircuit, Library } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path
        ? 'text-white bg-white/10'
        : 'text-slate-400 hover:text-white hover:bg-white/5';

    return (
        <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
            <nav className="glass rounded-full px-6 py-3 flex items-center justify-between w-full max-w-5xl">
                {/* Logo */}
                <Link to="/" className="text-xl font-bold flex items-center gap-2 group">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                        <Dumbbell className="text-white h-5 w-5" />
                    </div>
                    <span className="text-gradient">FitnessPro</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-1">
                    <NavLink to="/" icon={Home} label="Home" active={location.pathname === '/'} />

                    {user && (
                        <>
                            <NavLink to="/exercises" icon={Library} label="Exercises" active={location.pathname === '/exercises'} />
                            <NavLink to="/ai-coach" icon={BrainCircuit} label="AI Coach" active={location.pathname === '/ai-coach'} />
                            <NavLink to="/profile" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/profile'} />
                        </>
                    )}
                </div>

                {/* Auth Buttons */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <button
                            onClick={logout}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors flex items-center gap-2"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    ) : (
                        <>
                            <Link to="/login" className="hidden sm:block text-slate-300 hover:text-white font-medium text-sm transition-colors">
                                Login
                            </Link>
                            <Link to="/register" className="btn-gradient px-5 py-2 rounded-full text-sm font-medium">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>
            </nav>
        </div>
    );
};

const NavLink = ({ to, icon: Icon, label, active }) => (
    <Link
        to={to}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${active ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
    >
        <Icon size={16} />
        <span>{label}</span>
    </Link>
);

export default Navbar;
