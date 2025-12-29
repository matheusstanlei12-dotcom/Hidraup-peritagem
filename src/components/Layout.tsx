import React from 'react';
import { Sidebar } from './Sidebar';
import './Layout.css';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="layout-root">
            <Sidebar />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};
