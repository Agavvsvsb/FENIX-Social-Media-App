import React, { useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Box,
    Tooltip,
    InputBase,
    Badge,
    Paper,
    Popper,
    List,
    ListItem,
    ClickAwayListener,
} from "@mui/material";
import {
    Add as AddIcon,
    Menu as MenuIcon,
    Search as SearchIcon,
} from "@mui/icons-material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import HomeFilledIcon from "@mui/icons-material/HomeFilled";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useApp } from "../AppProvider";
import { useLocation, useNavigate } from "react-router";
import { styled, alpha } from "@mui/material/styles";
import ThemeToggle from "./ThemeToggle";

const Search = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: "20px",
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": { backgroundColor: alpha(theme.palette.common.white, 0.25) },
    marginRight: theme.spacing(5),
    marginLeft: 0,
    width: "100%",
    height: "36px",
    [theme.breakpoints.up("sm")]: {
        marginLeft: theme.spacing(3),
        width: "auto",
    },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    left: 0,
    top: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: "inherit",
    width: "100%",
    height: "100%",
    "& .MuiInputBase-input": {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create("width"),
        width: "100%",
        height: "100%",
        "&::placeholder": { opacity: 0.7, color: "inherit" },
        [theme.breakpoints.up("md")]: { width: "20ch" },
    },
}));

export default function Header() {
    const { showForm, setShowForm, mobileOpen, setMobileOpen } = useApp();
    const location = useLocation();
    const navigate = useNavigate();

    const [searchText, setSearchText] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const fetchUsers = async (query) => {
        const token = localStorage.getItem("token");
        const api =
            "http://localhost:8080/search/users?search=" +
            encodeURIComponent(query);
        if (!api) {
            console.error("API URL is not set");
            return;
        }
        if (!token) {
            console.error("No token found");
            return;
        }
        try {
            const res = await fetch(api, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            setFilteredUsers(data);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchText(value);
        setAnchorEl(e.currentTarget);
        if (value.trim()) {
            fetchUsers(value.trim());
        } else {
            setFilteredUsers([]);
        }
    };

    const handleUserSelect = (user) => {
        if (!user || !user.id) {
            console.error("Invalid user object:", user);
            return;
        }

        console.log("Navigating to user profile:", user.id);
        setSearchText("");
        setFilteredUsers([]);
        setAnchorEl(null); // Close the search results

        setTimeout(() => {
            if (location.pathname === "/profile") {
                navigate(`/profile/${user.id}`, { replace: true });
            } else {
                navigate(`/profile/${user.id}`, { replace: true });
            }
        }, 100);
    };

    return (
        <AppBar position="fixed">
            <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{
                            mr: 2,
                            ...(location.pathname === "/"
                                ? { display: "inline-flex" }
                                : { display: "none" }),
                            "@media (min-width: 1370px)": { display: "none" },
                            ml: 3,
                        }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {location.pathname !== "/" &&
                        location.pathname !== "/login" &&
                        location.pathname !== "/register" && (
                            <IconButton
                                sx={{
                                    display: { sm: "inline-flex", xs: "none" },
                                    color: "inherit",
                                }}
                                onClick={() => navigate("/")}
                            >
                                <HomeFilledIcon color="inherit" />
                            </IconButton>
                        )}

                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        <IconButton
                            sx={{ p: 0.5, pt: 0.8 }}
                            onClick={() => navigate("/")}
                        >
                            <ChatBubbleOutlineIcon
                                sx={{
                                    fontSize: "31px",
                                    color: (theme) =>
                                        theme.palette.mode === "light"
                                            ? "#ffffff"
                                            : "rgb(95, 191, 255)",
                                }}
                            />
                        </IconButton>
                        <Typography
                            sx={{
                                fontWeight: "bold",
                                fontSize: "22px",
                                color: (theme) =>
                                    theme.palette.mode === "light"
                                        ? "#ffffff"
                                        : "rgb(95, 191, 255)",
                            }}
                        >
                            Finex
                        </Typography>

                        <ClickAwayListener
                            onClickAway={() => setFilteredUsers([])}
                        >
                            <Box sx={{ position: "relative" }}>
                                <Search>
                                    <SearchIconWrapper>
                                        <SearchIcon />
                                    </SearchIconWrapper>
                                    <StyledInputBase
                                        placeholder="Search Users..."
                                        inputProps={{ "aria-label": "search" }}
                                        fullWidth
                                        value={searchText}
                                        onChange={handleSearchChange}
                                    />
                                </Search>

                                <Popper
                                    open={filteredUsers.length > 0}
                                    anchorEl={anchorEl}
                                    style={{ zIndex: 1300 }}
                                    placement="bottom-start"
                                >
                                    <Paper
                                        style={{
                                            width: anchorEl?.offsetWidth || 250,
                                        }}
                                    >
                                        <List dense>
                                            {filteredUsers.map((user) => (
                                                <ListItem
                                                    button
                                                    key={user.id}
                                                    onClick={() =>
                                                        handleUserSelect(user)
                                                    }
                                                >
                                                    {user.name} ({user.username}
                                                    )
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Paper>
                                </Popper>
                            </Box>
                        </ClickAwayListener>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 3 }}>
                    <Tooltip title="Notifications">
                        <IconButton size="large" color="inherit">
                            <Badge badgeContent={17} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={showForm ? "Close form" : "Open form"}>
                        <IconButton
                            sx={{ color: "inherit" }}
                            onClick={() => setShowForm(!showForm)}
                        >
                            <AddIcon sx={{ fontSize: "30px" }} />
                        </IconButton>
                    </Tooltip>
                    <ThemeToggle />
                </Box>
            </Toolbar>
        </AppBar>
    );
}
