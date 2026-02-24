import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';

const LandingPage = () => {
    const navigate = useNavigate();
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    const hasAlerted = useRef(false);;

    useEffect(() => {
        if (!hasAlerted.current) {
            alert("Welcome to the Researcher Writer Duo demo! connecting to backend can take up to 10-20 seconds on the first load, please be patient :)");
            hasAlerted.current = true;
        }
    }, []);

    const handleGuestLogin = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/guest-init`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('isGuest', 'true');
                navigate('/dashboard');
            }
        } catch (err) {
            console.error("Guest login failed", err);
        }
    };

    return (
        <div className="min-h-dvh flex flex-col bg-slate-950 text-white overflow-y-auto font-sans">
        
            <nav className="flex justify-between items-center px-6 py-5 max-w-7xl w-full mx-auto shrink-0">
                <h1 className="text-lg md:text-xl font-black tracking-tighter text-cyan-400">
                    RESEARCHER_WRITER<span className="text-white">.DUO</span>
                </h1>
                <div className="flex items-center gap-4 md:gap-8">
                    <div className="hidden md:flex gap-6 text-[10px] font-black tracking-widest text-slate-500">
                        <a href="mailto:anubhavjogani@gmail.com" className="hover:text-cyan-400 transition">CONTACT</a>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-white text-black px-4 py-1.5 md:px-5 md:py-1.5 rounded-full text-[10px] md:text-xs font-black hover:bg-cyan-400 transition transform hover:scale-105"
                    >
                        SIGN IN
                    </button>
                </div>
            </nav>

            <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-0">
                <div className="max-w-4xl w-full text-center space-y-6 md:space-y-8">
                    
                    <div className="inline-block px-3 py-1 border border-cyan-500/20 bg-cyan-500/5 rounded-md">
                        <p className="text-[9px] md:text-[10px] font-bold tracking-widest md:tracking-[0.2em] text-cyan-500 uppercase">
                            Agentic Workflow: Research • Refine • Post
                        </p>
                    </div>

                    <h2 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] md:leading-[0.85] uppercase">
                        Deep Research. <br />
                        <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-600">
                            Human Polish.
                        </span>
                    </h2>

                    <p className="text-slate-400 text-base md:text-xl max-w-2xl mx-auto font-light leading-relaxed">
                        A specialized multi-agent system that scrapes data, audits for AI-isms, 
                        and generates high-conversion LinkedIn content in one click.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                        <button
                            onClick={handleGuestLogin}
                            className="w-full sm:w-auto bg-cyan-500 text-black px-8 py-4 md:px-10 md:py-5 rounded-xl font-black text-lg md:text-xl hover:bg-white transition-all shadow-[0_0_30px_rgba(6,182,212,0.2)]"
                        >
                            TRY AS GUEST
                        </button>
                        <button
                            onClick={() => navigate('/signup')}
                            className="w-full sm:w-auto border-2 border-slate-800 bg-slate-900/50 backdrop-blur-md px-8 py-4 md:px-10 md:py-5 rounded-xl font-black text-lg md:text-xl hover:border-cyan-400 transition-all"
                        >
                            CREATE ACCOUNT
                        </button>
                    </div>

                    <div className="pt-8 hidden md:block">
                        <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                            <span>Agent A: Research</span>
                            <div className="h-px w-8 bg-slate-800"></div>
                            <span>Agent B: Refine</span>
                            <div className="h-px w-8 bg-slate-800"></div>
                            <span>Agent C: Write</span>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="w-full py-6 border-t border-slate-900/50 shrink-0">
                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4 opacity-30">
                    <p className="text-[10px] font-bold">© 2026 RESEARCHER WRITER DUO</p>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] font-bold uppercase tracking-tighter">
                        <span>React v19</span>
                        <span>Passport.js</span>
                        <span>Express.js</span>
                        <span>Gemini 3 Flash</span>
                        <span>AWS RDS</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;