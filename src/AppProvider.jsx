import { useContext, createContext, useState, useMemo } from "react";

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
    const [mode, setMode] = useState("light");
    const [showDrawer, setShowDrawer] = useState(false);
    const [Auth, setAuth] = useState(true);

    const theme = useMemo(() => {
        return createTheme({
            palette: {
                mode,
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
