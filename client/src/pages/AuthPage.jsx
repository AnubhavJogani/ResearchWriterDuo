import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowBigLeft } from 'lucide-react';

const AuthPage = ({ mode = 'login' }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });

    const handleGoogleAuth = () => {
        alert('Google OAuth flow would be initiated here. This is under development');
        // window.location.href = 'https://researchwriterduo.onrender.com/auth/google';
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const endpoint = mode === 'login' ? '/api/login' : '/api/signup';
        try {
            const data = {
                username: formData.username,
                password: formData.password,      
            }
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            const result = await response.json();
            if (result.success) {
                if (mode === 'signup') {
                    alert('Account created successfully! Please log in.');
                    navigate('/login');
                } else {
                    localStorage.setItem('user', result.userId);
                    localStorage.removeItem('guest_id');
                    navigate('/dashboard');
                }
            }
        } catch (error) {
            console.error("Auth error:", error);
            alert("Something went wrong. Please try again.");
        }
    }

    return (
        <div className="h-dvh flex items-center justify-center bg-slate-950 text-white font-sans p-4">
            <div className="flex items-center absolute top-4 right-4 cursor-pointer gap-2" onClick={() => navigate('/')}>
                <ArrowBigLeft color='white' />
                <h1 className="text-lg font-black text-white">
                   Back to <span className="text-cyan-400 hover:text-cyan-500 transition cursor-pointer">Home</span>
                </h1>
            </div>

            
            <div className="w-90 bg-slate-900/40 border border-slate-800 p-8 rounded-2xl">

                <div className="text-center mb-8">
                    <h1 className="text-sm font-black tracking-[0.3em] text-cyan-500 uppercase mb-2">
                        {mode === 'login' ? 'Auth_Identity' : 'New_Identity'}
                    </h1>
                    <p className="text-[11px] text-slate-500 uppercase tracking-widest">
                        Access Dashboard
                    </p>
                </div>

                <button
                    onClick={handleGoogleAuth}
                    className="w-full flex items-center justify-center gap-2 bg-white text-black py-2.5 rounded-lg text-xs font-bold hover:bg-cyan-400 transition-all"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-3.5 h-3.5" />
                    Continue with Google
                </button>

                <div className="relative flex items-center py-6">
                    <div className="grow border-t border-slate-800"></div>
                    <span className="shrink mx-3 text-[9px] font-bold text-slate-600 uppercase tracking-widest">OR</span>
                    <div className="grow border-t border-slate-800"></div>
                </div>

                <form className="space-y-4" onSubmit={handleFormSubmit}>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Username</label>
                        <input
                            type="text"
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:border-cyan-500 focus:outline-none transition-colors"
                            placeholder="e.g. anubh_01"
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                        <input
                            type="password"
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:border-cyan-500 focus:outline-none transition-colors"
                            placeholder="••••••••"
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold py-3 rounded-lg transition-all uppercase tracking-widest mt-2">
                        {mode === 'login' ? 'Initialize Session' : 'Create Credentials'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate(mode === 'login' ? '/signup' : '/login')}
                        className="text-[10px] text-slate-500 hover:text-cyan-400 uppercase tracking-wider transition"
                    >
                        {mode === 'login' ? "Need an account? Sign Up" : "Have an account? Log In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;