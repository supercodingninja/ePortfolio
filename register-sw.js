/*
================================================================================
FILE: register-sw.js
PROJECT: ePortfolio PWA Refactor
AUTHOR: Frederick Thomas (The Super Coding Ninja™)
DESCRIPTION: Service Worker registration with update handling, UI notifications,
             and intelligent refresh logic
================================================================================
*/

/*
This Area Of Code Is: Service Worker Registration Check
Explanation: Verifies browser support for service workers before attempting registration
In Other Words: Checks if the browser can handle offline mode before trying to set it up
*/
if ('serviceWorker' in navigator) {
    /*
    This Area Of Code Is: Window Load Event Listener
    Explanation: Waits for page to fully load before registering service worker
    In Other Words: Sets up offline mode only after the page is done loading
    */
    window.addEventListener('load', () => {
        /*
        This Area Of Code Is: Service Worker Registration Call
        Explanation: Registers the service worker file with the browser
        In Other Words: Tells the browser to start the offline mode manager
        */
        navigator.serviceWorker.register('./service-worker.js')
            .then((registration) => {
                /*
                This Area Of Code Is: Registration Success Handler
                Explanation: Logs successful registration and sets up update listeners
                In Other Words: Sets up monitoring for when new versions are available
                */
                console.log('[SW] Registered successfully:', registration.scope);
                
                /*
                This Area Of Code Is: Update Found Event Listener
                Explanation: Detects when a new service worker version is available
                In Other Words: Notices when there's a new version of the website ready
                */
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    
                    newWorker.addEventListener('statechange', () => {
                        /*
                        This Area Of Code Is: State Change Handler
                        Explanation: Monitors service worker installation progress
                        In Other Words: Watches the new version as it installs
                        */
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            /*
                            This Area Of Code Is: Update Available Notification
                            Explanation: Shows notification when new version is ready
                            In Other Words: Tells the user there's a new version available
                            */
                            showUpdateNotification(newWorker);
                        }
                    });
                });
                
                /*
                This Area Of Code Is: Periodic Update Check
                Explanation: Checks for updates every hour while page is open
                In Other Words: Looks for new versions once per hour automatically
                */
                setInterval(() => {
                    registration.update();
                    console.log('[SW] Checking for updates...');
                }, 60 * 60 * 1000); // 1 hour
                
            })
            .catch((error) => {
                /*
                This Area Of Code Is: Registration Error Handler
                Explanation: Logs any errors during service worker registration
                In Other Words: Reports problems if offline mode fails to start
                */
                console.error('[SW] Registration failed:', error);
            });
        
        /*
        This Area Of Code Is: Controller Change Listener
        Explanation: Detects when a new service worker takes control
        In Other Words: Notices when the new version starts running
        */
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true;
                /*
                This Area Of Code Is: Page Refresh Logic
                Explanation: Reloads page to activate new service worker version
                In Other Words: Refreshes the page to use the new version
                */
                window.location.reload();
            }
        });
    });
} else {
    /*
    This Area Of Code Is: No Service Worker Support Handler
    Explanation: Logs when browser doesn't support service workers
    In Other Words: Reports that this browser can't do offline mode
    */
    console.log('[SW] Service Worker not supported in this browser');
}

/*
================================================================================
UPDATE NOTIFICATION UI
================================================================================
*/

/*
This Area Of Code Is: Update Notification Function
Explanation: Creates and displays a notification banner for available updates
In Other Words: Shows a banner telling users there's a new version available
*/
function showUpdateNotification(worker) {
    /*
    This Area Of Code Is: Notification Container Creation
    Explanation: Creates DOM elements for the update notification banner
    In Other Words: Builds the "New version available" banner HTML
    */
    const notification = document.createElement('div');
    notification.id = 'sw-update-notification';
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    /*
    This Area Of Code Is: Notification Styling
    Explanation: Applies inline styles for the notification appearance
    In Other Words: Makes the banner look good with CSS
    */
    notification.style.cssText = `
        position: fixed;
        bottom: 1.5rem;
        right: 1.5rem;
        background: linear-gradient(135deg, #6b4ee6 0%, #00d4ff 100%);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 0.625rem 2.5rem rgba(0, 0, 0, 0.4);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 1rem;
        font-family: 'Inter', sans-serif;
        font-size: 0.875rem;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
        max-width: calc(100% - 3rem);
    `;
    
    /*
    This Area Of Code Is: Notification Content
    Explanation: HTML content for the update notification
    In Other Words: The text and buttons inside the banner
    */
    notification.innerHTML = `
        <span style="font-size: 1.25rem;">🚀</span>
        <span>New version available!</span>
        <button id="sw-update-btn" style="
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
            cursor: pointer;
            font-weight: 600;
            transition: background 0.2s;
            white-space: nowrap;
        ">Update Now</button>
        <button id="sw-dismiss-btn" style="
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.8);
            cursor: pointer;
            font-size: 1.25rem;
            line-height: 1;
            padding: 0.25rem;
        " aria-label="Dismiss notification">×</button>
    `;
    
    /*
    This Area Of Code Is: Animation Styles Injection
    Explanation: Adds keyframe animation for notification entrance
    In Other Words: Adds the slide-in animation to the page
    */
    if (!document.getElementById('sw-animations')) {
        const style = document.createElement('style');
        style.id = 'sw-animations';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    /*
    This Area Of Code Is: Notification DOM Insertion
    Explanation: Adds the notification to the page
    In Other Words: Puts the banner on the screen
    */
    document.body.appendChild(notification);
    
    /*
    This Area Of Code Is: Update Button Handler
    Explanation: Handles click on "Update Now" button to activate new version
    In Other Words: What happens when the user clicks the Update button
    */
    document.getElementById('sw-update-btn').addEventListener('click', () => {
        /*
        This Area Of Code Is: Skip Waiting Message
        Explanation: Sends message to service worker to activate immediately
        In Other Words: Tells the new version to start working right now
        */
        worker.postMessage('skipWaiting');
        notification.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
    });
    
    /*
    This Area Of Code Is: Dismiss Button Handler
    Explanation: Handles click on dismiss button to hide notification
    In Other Words: What happens when you click the X to close the banner
    */
    document.getElementById('sw-dismiss-btn').addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
    });
    
    /*
    This Area Of Code Is: Auto-Dismiss Timer
    Explanation: Automatically removes notification after 10 seconds if not interacted
    In Other Words: Hides the banner after 10 seconds if ignored
    */
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 10000);
}

/*
================================================================================
CONNECTION STATUS MONITORING
================================================================================
*/

/*
This Area Of Code Is: Online Status Listener
Explanation: Detects when browser comes back online
In Other Words: Notices when internet connection returns
*/
window.addEventListener('online', () => {
    console.log('[SW] Connection restored');
    showConnectionStatus('online');
});

/*
This Area Of Code Is: Offline Status Listener
Explanation: Detects when browser loses internet connection
In Other Words: Notices when internet goes away
*/
window.addEventListener('offline', () => {
    console.log('[SW] Connection lost');
    showConnectionStatus('offline');
});

/*
This Area Of Code Is: Connection Status Notification Function
Explanation: Displays brief notification of connection status changes
In Other Words: Shows a quick message when the user goes online or offline
*/
function showConnectionStatus(status) {
    /*
    This Area Of Code Is: Status Notification Creation
    Explanation: Creates a small toast notification for connection changes
    In Other Words: Builds a small popup saying "You're online" or "You're offline"
    */
    const existing = document.getElementById('connection-status');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.id = 'connection-status';
    notification.style.cssText = `
        position: fixed;
        top: 5rem;
        left: 50%;
        transform: translateX(-50%);
        background: ${status === 'online' ? '#22c55e' : '#ef4444'};
        color: white;
        padding: 0.75rem 1.5rem;
        border-radius: 2rem;
        font-size: 0.875rem;
        font-weight: 500;
        z-index: 10001;
        box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.2);
        animation: fadeInOut 3s ease-in-out forwards;
    `;
    
    notification.textContent = status === 'online' ? '✓ Back online' : '✗ Offline mode';
    
    /*
    This Area Of Code Is: Fade Animation Styles
    Explanation: Adds fade in/out animation for connection status
    In Other Words: Makes the status message appear and disappear smoothly
    */
    if (!document.getElementById('connection-animations')) {
        const style = document.createElement('style');
        style.id = 'connection-animations';
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateX(-50%) translateY(-1rem); }
                10% { opacity: 1; transform: translateX(-50%) translateY(0); }
                90% { opacity: 1; transform: translateX(-50%) translateY(0); }
                100% { opacity: 0; transform: translateX(-50%) translateY(-1rem); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    /*
    This Area Of Code Is: Cleanup Timer
    Explanation: Removes the notification after animation completes
    In Other Words: Cleans up the status message after it fades out
    */
    setTimeout(() => notification.remove(), 3000);
}

/*
================================================================================
PWA INSTALL PROMPT
================================================================================
*/

/*
This Area Of Code Is: Before Install Prompt Storage
Explanation: Stores the install prompt event for later use
In Other Words: Saves the "Add to Home Screen" prompt so we can show it later
*/
let deferredPrompt = null;

/*
This Area Of Code Is: Before Install Prompt Event Listener
Explanation: Captures the browser's install prompt event
In Other Words: Catches the moment when the browser offers to install the app
*/
window.addEventListener('beforeinstallprompt', (event) => {
    /*
    This Area Of Code Is: Prompt Prevention
    Explanation: Prevents automatic prompt and stores for custom UI
    In Other Words: Stops the automatic popup so we can show it when we want
    */
    event.preventDefault();
    deferredPrompt = event;
    
    /*
    This Area Of Code Is: Install Button Display
    Explanation: Shows custom install button when app is installable
    In Other Words: Shows our own "Install App" button
    */
    showInstallButton();
});

/*
This Area Of Code Is: Install Button Display Function
Explanation: Creates and displays a PWA install button
In Other Words: Shows a button to add the app to my home screen
*/
function showInstallButton() {
    /*
    This Area Of Code Is: Existing Button Check
    Explanation: Prevents duplicate install buttons
    In Other Words: Makes sure we only show one install button
    */
    if (document.getElementById('pwa-install-btn')) return;
    
    const button = document.createElement('button');
    button.id = 'pwa-install-btn';
    button.innerHTML = '📱 Install App';
    button.style.cssText = `
        position: fixed;
        bottom: 1.5rem;
        left: 1.5rem;
        background: var(--color-bg-tertiary, #1a1a1a);
        color: var(--color-accent-gold, #d4af37);
        border: 0.125rem solid var(--color-accent-gold, #d4af37);
        padding: 0.75rem 1.25rem;
        border-radius: 0.5rem;
        font-weight: 600;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.3);
        transition: all 0.2s;
    `;
    
    /*
    This Area Of Code Is: Install Button Click Handler
    Explanation: Triggers the browser's install prompt when clicked
    In Other Words: Shows the "Add to Home Screen" dialog when the user clicks the button
    */
    button.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`[PWA] User ${outcome === 'accepted' ? 'installed' : 'dismissed'} the app`);
        
        deferredPrompt = null;
        button.remove();
    });
    
    document.body.appendChild(button);
}

/*
This Area Of Code Is: App Installed Event Listener
Explanation: Detects when PWA has been successfully installed
In Other Words: Notices when the user adds the app to their home screen
*/
window.addEventListener('appinstalled', () => {
    console.log('[PWA] App was installed');
    deferredPrompt = null;
    
    /*
    This Area Of Code Is: Install Button Removal
    Explanation: Removes install button after successful installation
    In Other Words: Hides the install button once the app is installed
    */
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) installBtn.remove();
});
