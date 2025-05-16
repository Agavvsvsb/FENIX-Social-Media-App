import { AppBar, Toolbar, Typography, IconButton, Box } from "@mui/material";
import { Add as AddIcon, ArrowBack } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { useLocation, useNavigate } from "react-router";
import { useApp } from "../AppProvider";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
    const { showForm, setShowForm, setShowDrawer } = useApp();
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
                        onClick={() => setShowForm(!showForm)}
                    >
                        <AddIcon />
                    </IconButton>
                    <ThemeToggle />
                </Box>
            </Toolbar>
        </AppBar>
    );
}
