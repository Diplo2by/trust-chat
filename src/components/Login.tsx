import { supabase } from '@/supabaseClient';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { ShieldCheck } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) {
                throw error;
            }
            // Redirect to a dashboard or home page after successful login
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full h-screen flex items-center justify-center bg-white">
            <Card className="w-full max-w-md shadow-2xl border-2 border-emerald-600">
                <CardHeader className="text-center bg-emerald-800 text-white py-6 flex flex-col items-center">
                    <div className="flex items-center justify-center mb-2">
                        <ShieldCheck className="mr-2 text-emerald-300" size={36} />
                        <CardTitle className="text-3xl font-bold">
                            Trust Chat
                        </CardTitle>
                    </div>
                    <CardDescription className="text-emerald-200 flex items-center">
                        Secure Messaging Platform
                    </CardDescription>
                </CardHeader>
                <CardContent className="bg-white p-6 space-y-6">
                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <Dialog open={!!error} onOpenChange={() => setError('')}>
                                <DialogContent className="bg-white border-emerald-600 text-black">
                                    <DialogHeader>
                                        <DialogTitle className="text-emerald-700">Authentication Error</DialogTitle>
                                        <DialogDescription className="text-emerald-900">
                                            {error}
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                                            onClick={() => setError('')}
                                        >
                                            Close
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}

                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="text-emerald-700"
                            >
                                Email Address
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-white text-emerald-900 border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="password"
                                className="text-emerald-700"
                            >
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-white text-emerald-900 border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-emerald-700 hover:bg-emerald-600 text-white"
                            >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full border-emerald-700 text-emerald-700 hover:bg-emerald-50"
                                onClick={() => navigate('/signup')}
                            >
                                Sign Up
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default Login