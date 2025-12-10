import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Logo from './Logo';

/**
 * OAuth Callback Handler
 * Handles the redirect from OAuth providers (Google, GitHub)
 */
const AuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { handleOAuthCallback } = useStore();
    const [error, setError] = useState(null);

    useEffect(() => {
        const processCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const errorParam = searchParams.get('error');

            if (errorParam) {
                setError('Authentication was cancelled or failed');
                toast.error('Authentication failed');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            if (!code || !state) {
                setError('Invalid callback parameters');
                toast.error('Invalid authentication response');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            try {
                // Determine provider from state (stored in backend)
                // We'll try both endpoints, the correct one will work
                await handleOAuthCallback(code, state);
                toast.success('Authentication successful!');

                // The store will have updated user info
                // App.js will handle redirect based on access_granted
            } catch (err) {
                console.error('OAuth callback error:', err);
                setError(err.message || 'Authentication failed');
                toast.error('Authentication failed. Please try again.');
                setTimeout(() => navigate('/login'), 2000);
            }
        };

        processCallback();
    }, [searchParams, handleOAuthCallback, navigate]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-fade-in">
                <div className="p-8 text-center">
                    <Logo size="lg" showText={false} onClick={() => { }} className="mb-6 justify-center" />

                    {error ? (
                        <>
                            <h2 className="text-xl font-bold mb-2 text-destructive">Authentication Failed</h2>
                            <p className="text-muted-foreground text-sm mb-4">{error}</p>
                            <p className="text-xs text-muted-foreground">Redirecting to login...</p>
                        </>
                    ) : (
                        <>
                            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                            <h2 className="text-xl font-bold mb-2">Completing Sign In</h2>
                            <p className="text-muted-foreground text-sm">
                                Please wait while we verify your credentials...
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthCallback;
