import { useState, useEffect } from 'react';
import { isPermissionGranted, requestPermission } from '@tauri-apps/plugin-notification';
import { error } from '@tauri-apps/plugin-log';

export const useNotifications = () => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    useEffect(() => {
        async function checkNotificationPermission() {
            try {
                // Check if notification permission is already granted
                let permissionGranted = await isPermissionGranted();

                // If not granted, request permission
                if (!permissionGranted) {
                    const permission = await requestPermission();
                    permissionGranted = permission === 'granted';
                }
                setNotificationsEnabled(permissionGranted);
            } catch (err: any) {
                error('Error checking notification permissions:', err);
            }
        }

        checkNotificationPermission();
    }, []);

    return { notificationsEnabled };
};