import * as React from 'react';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import Person4Icon from '@mui/icons-material/Person4';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import { useNavigate, useLocation } from 'react-router';
import { Avatar } from '@mui/material';
import { useApp } from '../AppProvider';

const drawerWidth = 270;

function ResponsiveDrawer() {
  const { showDrawer, setShowDrawer,setAuth, Auth, mobileOpen, setMobileOpen } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Only show drawer on home page
  const isHomePage = location.pathname === '/';

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  const toggleDrawer = (newOpen) => () => {
    setMobileOpen(newOpen);
  };

  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, setMobileOpen]);

  const drawer = (
    <Box>
      <Box sx={{ height: 200, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        {Auth && <>
          <Box sx={{
            backgroundColor: "#3674B5",
            borderLeft: '40px solid transparent',
            borderRight: '40px solid transparent',
            borderBottom: '40px solid #3674B5',
            borderTop: '40px solid #3674B5',
            borderRadius: '8px',
            
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            <Typography
              sx={{
                position: 'absolute',
                color: '#fff',
                textAlign: "center",
                fontSize: "30px"
              }}
            >
              {Auth.name ? Auth.name[0] : Auth.username ? Auth.username[0] : '?'}
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: "bold", marginTop: 2 }}>{Auth.name}</Typography>
        </>}
      </Box>
      <Divider sx={{ borderBottomWidth: "2px" }} />

      <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <ListItem disablePadding sx={{ width: '100%', textAlign: 'center' }}>
          <ListItemButton onClick={() => navigate("/")} sx={{ justifyContent: 'center' }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider sx={{ borderBottomWidth: "2px" }} />

      {Auth && (
        <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ListItem disablePadding sx={{ width: '100%', textAlign: 'center' }}>
            <ListItemButton onClick={() => navigate(`/profile/${Auth.id}`)} sx={{ justifyContent: 'center' }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Person4Icon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ width: '100%', textAlign: 'center' }}>
            <ListItemButton
              onClick={() => {
                localStorage.removeItem("token");
                setAuth(null);
                navigate("/");
              }}
              sx={{ justifyContent: 'center' }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      )}

      {!Auth && (
        <List sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ListItem disablePadding sx={{ width: '100%', textAlign: 'center' }}>
            <ListItemButton onClick={() => navigate("/register")} sx={{ justifyContent: 'center' }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <AppRegistrationIcon />
              </ListItemIcon>
              <ListItemText primary="Register" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ width: '100%', textAlign: 'center' }}>
            <ListItemButton
              onClick={toggleDrawer(false)}
              sx={{ justifyContent: 'center' }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItemButton>
          </ListItem>
        </List>
      )}
    </Box>
  );

  if (!isHomePage) {
    return null;
  }

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerClose}
        sx={{
          display: { xs: 'block' },
          
          '@media (min-width: 1300px)': { display: 'none' },
          '& .MuiDrawer-paper': {
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark'
                ? theme.palette.background.paper
                : undefined,
            width: drawerWidth,
            top: '72px',
            left: '20px',
            height: 'calc(100% - 72px)',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            borderRadius: '8px',
            boxShadow: '2px 2px 8px rgba(0,0,0,0.1)'
          },
          
        }}
      >
        {drawer}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          marginTop: { xs: '96px', md: '0' },
          marginLeft: { xs: '20px', md: '0' },
          marginBottom: { xs: '20px', md: '0' },
          display: { xs: 'none' },
          '@media (min-width: 1300px)': { display: 'block' }, // Show at 1370px and above
          '& .MuiDrawer-paper': {
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark'
                ? theme.palette.background.paper
                : undefined,
            width: drawerWidth,
            top: '96px',
            left: '20px',
            height: 'calc(100% - 96px)',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            borderRadius: '8px',
            boxShadow: '2px 2px 8px rgba(0,0,0,0.1)'
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default ResponsiveDrawer;
