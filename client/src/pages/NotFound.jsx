import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 text-center">
            <div className="max-w-md">
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full"></div>
                        <AlertTriangle size={80} className="text-blue-500 relative z-10" />
                    </div>
                </div>

                <h1 className="text-6xl font-bold text-white mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-slate-300 mb-6">Page Not Found</h2>
                <p className="text-slate-400 mb-8">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <Link to="/" className="btn-gradient inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-transform hover:scale-105">
                    <Home size={20} />
                    Back to Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
