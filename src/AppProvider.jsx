import { useContext, createContext, useState, useMemo, useEffect } from "react";

import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import AppRouter from "./AppRouter";

const AppContext = createContext();
const queryClient = new QueryClient();

export function useApp() {
    return useContext(AppContext);
}

export default function AppProvider() {
    const [showForm, setShowForm] = useState(false);
    const [mode, setMode] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });
    const [showDrawer, setShowDrawer] = useState(false);
    const [Auth, setAuth] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if(token) {
            setIsAuthLoading(true);
            fetch("http://localhost:8080/verify", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error("Token verification failed");
                }
                return res.json();
            })
            .then(user => {
                setAuth(user);
                setIsAuthLoading(false);
            })
            .catch((error) => {
                console.error("Auth verification error:", error);
                localStorage.removeItem("token");
                setAuth(null);
                setIsAuthLoading(false);
            });
        } else {
            setIsAuthLoading(false);
        }
    }, []);

    const theme = useMemo(() => {
        // Save theme preference to localStorage whenever it changes
        localStorage.setItem('theme', mode);
        document.documentElement.setAttribute('data-theme', mode);
        
        return createTheme({
            palette: {
                mode,
                ...(mode === 'dark' ? {
                    background: {
                        default: '#121212',
                        paper: '#1e1e1e',
                    },
                } : {
                    background: {
                        default: '#f5f5f5',
                        paper: '#ffffff',
                    },
                }),
            },
        });
    }, [mode]);

    return (
        <AppContext.Provider
            value={{
                showForm,
                setShowForm,
                mode,
                setMode,
                showDrawer,
                setShowDrawer,
                Auth,
                setAuth,
                isAuthLoading,  // Expose loading state to components
            }}
        >
            <QueryClientProvider client={queryClient}>
                <ThemeProvider theme={theme}>
                    <AppRouter />
                    <CssBaseline />
                </ThemeProvider>
            </QueryClientProvider>
        </AppContext.Provider>
    );
}
