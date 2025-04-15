import { AppBar, Toolbar, Typography, IconButton, Box } from "@mui/material";

import { Add as AddIcon, ArrowBack } from "@mui/icons-material";

import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import MenuIcon from "@mui/icons-material/Menu";

import { useLocation, useNavigate } from "react-router";

import { useApp } from "../AppProvider";

export default function Header() {
    const { showForm, setShowForm, mode, setMode, setShowDrawer } = useApp();
    const { pathname } = useLocation();
    const navigate = useNavigate();

    return (
        <AppBar position="fixed">
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    {pathname == "/" ? (
                        <IconButton
                            sx={{ color: "inherit" }}
                            onClick={() => {
                                setShowDrawer(true);
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                    ) : (
                        <IconButton
                            sx={{ color: "inherit" }}
                            onClick={() => {
                                navigate(-1);
                            }}
                        >
                            <ArrowBack />
                        </IconButton>
                    )}
                    <Typography sx={{ fontWeight: "bold" }}>FENIX</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 3 }}>
                    <IconButton
                        sx={{ color: "inherit" }}
                        onClick={() => {
                            setShowForm(!showForm);
                        }}
                    >
                        <AddIcon />
                    </IconButton>
                    {mode == "light" ? (
                        <IconButton
                            sx={{ color: "inherit" }}
                            onClick={() => {
                                setMode("dark");
                            }}
                        >
                            <DarkModeIcon />
                        </IconButton>
                    ) : (
                        <IconButton
                            sx={{ color: "inherit" }}
                            onClick={() => {
                                setMode("light");
                            }}
                        >
                            <LightModeIcon />
                        </IconButton>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}
