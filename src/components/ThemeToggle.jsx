import { IconButton, Tooltip } from "@mui/material";
import { useApp } from "../AppProvider";
import ModeNightIcon from '@mui/icons-material/ModeNight';
import LightModeIcon from '@mui/icons-material/LightMode';

export default function ThemeToggle() {
    const { mode, setMode } = useApp();
    
    const toggleTheme = () => {
        setMode(currentMode => (currentMode === 'light' ? 'dark' : 'light'));
    };

    return (
        <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton onClick={toggleTheme} color="inherit">
                {mode === 'dark' ? <ModeNightIcon /> : <LightModeIcon />}
            </IconButton>
        </Tooltip>
    );
}
