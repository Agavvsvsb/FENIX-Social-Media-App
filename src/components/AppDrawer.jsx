// import Box from "@mui/material/Box";
// import Drawer from "@mui/material/Drawer";

// import List from "@mui/material/List";
// import Divider from "@mui/material/Divider";
// import ListItem from "@mui/material/ListItem";
// import ListItemButton from "@mui/material/ListItemButton";
// import ListItemIcon from "@mui/material/ListItemIcon";
// import ListItemText from "@mui/material/ListItemText";
// import HomeIcon from "@mui/icons-material/Home";
// import Person4Icon from "@mui/icons-material/Person4";
// import LoginIcon from "@mui/icons-material/Login";
// import LogoutIcon from "@mui/icons-material/Logout";
// import AppRegistrationIcon from "@mui/icons-material/AppRegistration";

// import { useApp } from "../AppProvider";


// import { useNavigate, useLocation } from "react-router";
// import { Avatar, Typography } from "@mui/material";

// export default function AppDrawer() {
//     const { showDrawer, setShowDrawer, Auth, setAuth } = useApp();
//     const navigate = useNavigate();
//     // Add location to check current route
//     const location = useLocation();
    

//     const isHomePage = location.pathname === "/";

//     const toggleDrawer = (newOpen) => () => {
//         setShowDrawer(newOpen);
//     };

//     const DrawerList = (
//         <Box
//             sx={{ width: 280 }}
//             role="presentation"
//             onClick={toggleDrawer(false)}
//         >
//             <Box sx={{ height: 200, paddingTop: 5.5, paddingRight: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
//                 {Auth && <>
//                     <Avatar sx={{ backgroundColor: "#3674B5", width: 100, height: 100 }}>
//                         {Auth.name ? Auth.name[0] : Auth.username ? Auth.username[0] : '?'}
//                     </Avatar>
//                     <Typography variant="h6" sx={{ fontWeight: "bold", marginTop: 2 }}>{Auth.name}</Typography>
//                 </>}
//             </Box>
//             <Divider />
//             <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//                 <ListItem disablePadding sx={{ width: '100%', textAlign: 'center' }}>
//                     <ListItemButton onClick={() => navigate("/")} sx={{ justifyContent: 'center' }}>
//                         <ListItemIcon sx={{ minWidth: 40 }}>
//                             <HomeIcon />
//                         </ListItemIcon>
//                         <ListItemText primary="Home" />
//                     </ListItemButton>
//                 </ListItem>
//             </List>
//             <Divider />

//             {Auth && (
//                 <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//                     <ListItem disablePadding sx={{ width: '100%', textAlign: 'center' }}>
//                         <ListItemButton onClick={() => navigate(`/profile/${Auth.id}`)} sx={{ justifyContent: 'center' }}>
//                             <ListItemIcon sx={{ minWidth: 40 }}>
//                                 <Person4Icon />
//                             </ListItemIcon>
//                             <ListItemText primary="Profile" />
//                         </ListItemButton>
//                     </ListItem>
//                     <ListItem disablePadding sx={{ width: '100%', textAlign: 'center' }}>
//                         <ListItemButton
//                             onClick={() => {
//                                 localStorage.removeItem("token");
//                                 setAuth(null);
//                                 navigate("/");
//                             }}
//                             sx={{ justifyContent: 'center' }}
//                         >
//                             <ListItemIcon sx={{ minWidth: 40 }}>
//                                 <LogoutIcon />
//                             </ListItemIcon>
//                             <ListItemText primary="Logout" />
//                         </ListItemButton>
//                     </ListItem>
//                 </List>
//             )}

//             {!Auth && (
//                 <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//                     <ListItem disablePadding sx={{ width: '100%', textAlign: 'center' }}>
//                         <ListItemButton onClick={() => navigate("/register")} sx={{ justifyContent: 'center' }}>
//                             <ListItemIcon sx={{ minWidth: 40 }}>
//                                 <AppRegistrationIcon />
//                             </ListItemIcon>
//                             <ListItemText primary="Register" />
//                         </ListItemButton>
//                     </ListItem>
//                     <ListItem disablePadding sx={{ width: '100%', textAlign: 'center' }}>
//                         <ListItemButton
//                             onClick={() => {
//                                 navigate("/login");
//                             }}
//                             sx={{ justifyContent: 'center' }}
//                         >
//                             <ListItemIcon sx={{ minWidth: 40 }}>
//                                 <LoginIcon />
//                             </ListItemIcon>
//                             <ListItemText primary="Login" />
//                         </ListItemButton>
//                     </ListItem>
//                 </List>
//             )}
//         </Box>
//     );

//     // Return null if not on home page
//     if (!isHomePage) {
//         return null;
//     }

//     return (
//         <div>
//             <Drawer open={showDrawer} onClose={toggleDrawer(false)}>
//                 {DrawerList}
//             </Drawer>
//         </div>
//     );
// }