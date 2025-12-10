import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { KeyRound, ArrowRight, Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Logo from './Logo';

const InvitePage = () => {
    const navigate = useNavigate();
    const { user, validateInviteCode, fetchUser, logout } = useStore();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // If user already has access, redirect to dashboard
        if (user?.access_granted) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!code.trim()) {
            toast.error('Please enter an invite code');
            return;
        }

        setLoading(true);
        try {
            await validateInviteCode(code.trim());
            setSuccess(true);
            toast.success('Access granted! Welcome to SynapsBranch');

            // Refresh user data and redirect
            await fetchUser();
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Invalid or expired invite code');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-fade-in">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8 text-center flex flex-col items-center">
                        <Logo size="lg" showText={false} onClick={() => { }} className="mb-4" />

                        {success ? (
                            <>
                                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="w-8 h-8 text-green-500" />
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome to the Beta!</h1>
                                <p className="text-muted-foreground text-sm">
                                    Redirecting you to your workspace...
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles className="w-5 h-5 text-amber-500" />
                                    <span className="text-xs font-medium text-amber-500 uppercase tracking-wider">Closed Beta</span>
                                </div>
                                <h1 className="text-2xl font-bold tracking-tight mb-2">Enter Access Code</h1>
                                <p className="text-muted-foreground text-sm">
                                    SynapsBranch is currently in closed beta. Enter your invite code to continue.
                                </p>
                            </>
                        )}
                    </div>

                    {!success && (
                        <>
                            {/* User Info (if logged in) */}
                            {user && (
                                <div className="mb-6 p-3 bg-muted/30 rounded-lg flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-8 h-8 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                                <span className="text-sm font-medium text-primary">
                                                    {user.name?.charAt(0) || user.email?.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="text-left">
                                            <p className="text-sm font-medium truncate max-w-[180px]">{user.name}</p>
                                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">{user.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            )}

                            {/* Invite Code Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground ml-1">Invite Code</label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="SYNAPSE-01"
                                            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 text-sm font-mono tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                                            autoComplete="off"
                                            data-testid="invite-code-input"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center group"
                                    data-testid="submit-invite-btn"
                                >
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            Unlock Access
                                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-6 pt-6 border-t border-border text-center">
                                <p className="text-xs text-muted-foreground">
                                    Don't have an invite code? <a href="mailto:support@synapsbranch.com" className="text-primary hover:underline">Request access</a>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvitePage;
