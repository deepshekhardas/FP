import { Link } from 'react-router-dom';
import { Trophy, Zap, Heart, ArrowRight } from 'lucide-react';

const Home = () => {
    return (
        <div className="relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl -z-10 animate-pulse delay-1000"></div>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                        <span className="block text-white">Unleash Your</span>
                        <span className="text-gradient">Potential with AI</span>
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-400">
                        The most advanced fitness tracker powered by Gemini AI. Get personalized workouts, real-time analytics, and a coach that never sleeps.
                    </p>

                    <div className="mt-10 flex justify-center gap-4">
                        <Link to="/register" className="btn-gradient px-8 py-4 rounded-full text-lg font-semibold flex items-center gap-2 group">
                            Start Free Trial
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link to="/login" className="px-8 py-4 rounded-full text-lg font-semibold text-white border border-slate-700 hover:bg-white/5 transition-colors">
                            Login
                        </Link>
                    </div>
                </div>
            </section>

            {/* Feature Section */}
            <section className="py-24 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-blue-500 font-semibold tracking-wide uppercase text-sm">Features</h2>
                        <p className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                            Engineered for Excellence
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                name: 'AI Workouts',
                                description: 'Generative AI creates custom plans based on your unique bio-metrics and goals.',
                                icon: Zap,
                                color: 'text-yellow-400',
                                bg: 'bg-yellow-400/10'
                            },
                            {
                                name: 'Elite Analytics',
                                description: 'Visualize your progress with pro-level charts and deep insights.',
                                icon: Trophy,
                                color: 'text-purple-400',
                                bg: 'bg-purple-400/10'
                            },
                            {
                                name: 'Health Monitor',
                                description: 'Keep track of vitals and recovery scores to optimize performance.',
                                icon: Heart,
                                color: 'text-red-400',
                                bg: 'bg-red-400/10'
                            },
                        ].map((feature) => (
                            <div key={feature.name} className="glass-card p-8 rounded-3xl hover:border-blue-500/50 transition-colors group">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.bg}`}>
                                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{feature.name}</h3>
                                <p className="text-slate-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
