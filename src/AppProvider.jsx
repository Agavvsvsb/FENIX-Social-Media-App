import { useContext, createContext, useState, useMemo } from "react";

import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

import App from "./App";

const AppContext = createContext();

export function useApp() {
    return useContext(AppContext);
}

export default function AppProvider() {
    const [showForm, setShowForm] = useState(false);
    const [mode, setMode] = useState("light");
    const [showDrawer, setShowDrawer] = useState(false);
    const [Auth, setAuth] = useState(true);

    const theme = useMemo(() => {
        return createTheme(
            {
                palette: {
                    mode,
                },
            },
            [mode]
        );
    });
    return (
        <AppContext
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
            <ThemeProvider theme={theme}>
                <App />
                <CssBaseline />
            </ThemeProvider>
        </AppContext>
    );
}
