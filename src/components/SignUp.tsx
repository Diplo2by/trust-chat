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
import { info } from '@tauri-apps/plugin-log'

const SignUp: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async (event: React.FormEvent) => {
        event.preventDefault();

        // Validate password match
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password
            });
            if (error) {
                info(error.message)
                throw error;
            }
            navigate('/login');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="w-full h-screen flex items-center justify-center bg-emerald-50">
            <Card className="w-full max-w-md shadow-2xl border-2 border-emerald-600">
                <CardHeader className="text-center bg-emerald-800 text-white py-6 flex flex-col items-center">
                    <div className="flex items-center justify-center mb-2">
                        <ShieldCheck className="mr-2 text-emerald-300" size={36} />
                        <CardTitle className="text-3xl font-bold">
                            Trust Chat
                        </CardTitle>
                    </div>
                    <CardDescription className="text-emerald-200 flex items-center">
                        Create Your Account
                    </CardDescription>
                </CardHeader>
                <CardContent className="bg-white p-6 space-y-6">
                    <form onSubmit={handleSignUp} className="space-y-4">
                        {error && (
                            <Dialog open={!!error} onOpenChange={() => setError('')}>
                                <DialogContent className="bg-white border-emerald-600 text-black">
                                    <DialogHeader>
                                        <DialogTitle className="text-emerald-700">Sign Up Error</DialogTitle>
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

                        <div className="space-y-2">
                            <Label
                                htmlFor="confirm-password"
                                className="text-emerald-700"
                            >
                                Confirm Password
                            </Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                                {isLoading ? 'Creating Account...' : 'Sign Up'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full border-emerald-700 text-emerald-700 hover:bg-emerald-50"
                                onClick={() => navigate('/login')}
                            >
                                Back to Login
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default SignUp