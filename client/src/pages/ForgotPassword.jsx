import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const res = await axios.post('/api/auth/forgot-password', { email });
            setMessage(res.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="glass-card max-w-md w-full p-8 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="mb-6">
                        <Link to="/login" className="text-slate-400 hover:text-white flex items-center gap-2 text-sm transition-colors">
                            <ArrowLeft size={16} /> Back to Login
                        </Link>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
                        <p className="text-slate-400">Enter your email to receive recovery instructions</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 mb-6">
                            <AlertCircle size={20} className="text-red-400" />
                            <p className="text-red-200 text-sm">{error}</p>
                        </div>
                    )}

                    {message && (
                        <div className="bg-green-500/10 border border-green-500/50 p-4 rounded-xl flex items-center gap-3 mb-6">
                            <CheckCircle size={20} className="text-green-400" />
                            <p className="text-green-200 text-sm">{message}</p>
                        </div>
                    )}

                    {!message && (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="input-dark w-full pl-11 pr-4 py-3 rounded-xl focus:outline-none"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-gradient w-full py-3.5 rounded-xl font-semibold text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending Link...' : 'Send Reset Link'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
