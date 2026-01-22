import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <SocketProvider>
                    <App />
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: 'rgba(30, 41, 59, 0.95)',
                                color: '#f1f5f9',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid rgba(71, 85, 105, 0.5)',
                                borderRadius: '12px',
                                padding: '16px',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            },
                            success: {
                                iconTheme: {
                                    primary: '#10b981',
                                    secondary: '#ffffff',
                                },
                                style: {
                                    borderColor: 'rgba(16, 185, 129, 0.3)',
                                },
                            },
                            error: {
                                iconTheme: {
                                    primary: '#ef4444',
                                    secondary: '#ffffff',
                                },
                                style: {
                                    borderColor: 'rgba(239, 68, 68, 0.3)',
                                },
                            },
                            loading: {
                                iconTheme: {
                                    primary: '#6366f1',
                                    secondary: '#ffffff',
                                },
                            },
                        }}
                    />
                </SocketProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
