'use client';

import Drawer from '../components/layout/Drawer';

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>My App</title>
            </head>
            <body>
                <Drawer />
                <main>{children}</main>
            </body>
        </html>
    );
}


