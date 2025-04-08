import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { WifiOff } from 'lucide-react';
import { Button } from './ui/button';

const InternetCheckModal: React.FC = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine)

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        }

    }, [])

    const handleRetry = () => {
        setIsOffline(!navigator.onLine);
    };

    return (
        <Dialog open={isOffline}>
            <DialogContent className="sm:max-w-[425px] bg-emerald-50" >
                <DialogHeader className="text-center">
                    <DialogTitle className="flex items-center justify-center gap-2">
                        <WifiOff className="text-red-500" size={24} />
                        No Internet Connection
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Please check your network connection and try again.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center">
                    <Button className=' bg-emerald-800 text-white' onClick={handleRetry} variant="outline">
                        Retry Connection
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default InternetCheckModal