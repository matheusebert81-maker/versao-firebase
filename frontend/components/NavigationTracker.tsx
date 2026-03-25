import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function NavigationTracker() {
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();

    // Post navigation changes to parent window
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.parent?.postMessage({
                type: "app_changed_url",
                url: window.location.href
            }, '*');
        }
    }, [pathname]);

    // Log user activity when navigating to a page
    useEffect(() => {
        if (isAuthenticated) {
            // Mock logging
            console.log("User navigated to:", pathname);
        }
    }, [pathname, isAuthenticated]);

    return null;
}
