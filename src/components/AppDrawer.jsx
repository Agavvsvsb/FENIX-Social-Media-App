import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";

import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import HomeIcon from "@mui/icons-material/Home";
import Person4Icon from "@mui/icons-material/Person4";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import AppRegistrationIcon from "@mui/icons-material/AppRegistration";

import { useApp } from "../AppProvider";

import { useNavigate } from "react-router";

export default function AppDrawer() {
    const { showDrawer, setShowDrawer, Auth, setAuth } = useApp();
    const navigate = useNavigate();

    const toggleDrawer = (newOpen) => () => {
        setShowDrawer(newOpen);
    };

    const DrawerList = (
        <Box
            sx={{ width: 280 }}
            role="presentation"
            onClick={toggleDrawer(false)}
        >
            <Box sx={{ height: 200 }}></Box>
            <Divider />
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate("/")}>
                        <ListItemIcon>
                            <HomeIcon />
                        </ListItemIcon>
                        <ListItemText primary="Home" />
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider />

            {Auth && (
                <List>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => navigate("/profile")}>
                            <ListItemIcon>
                                <Person4Icon />
                            </ListItemIcon>
                            <ListItemText primary="Profile" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={() => {
                                setAuth(false);
                            }}
                        >
                            <ListItemIcon>
                                <LogoutIcon />
                            </ListItemIcon>
                            <ListItemText primary="Logout" />
                        </ListItemButton>
                    </ListItem>
                </List>
            )}

            {!Auth && (
                <List>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => navigate("/register")}>
                            <ListItemIcon>
                                <AppRegistrationIcon />
                            </ListItemIcon>
                            <ListItemText primary="Register" />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton
                            onClick={() => {
                                navigate("/login");
                            }}
                        >
                            <ListItemIcon>
                                <LoginIcon />
                            </ListItemIcon>
                            <ListItemText primary="Login" />
                        </ListItemButton>
                    </ListItem>
                </List>
            )}
        </Box>
    );

    return (
        <div>
            <Drawer open={showDrawer} onClose={toggleDrawer(false)}>
                {DrawerList}
            </Drawer>
        </div>
    );
}
