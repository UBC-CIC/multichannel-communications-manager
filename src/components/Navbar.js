import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Grid,
  CircularProgress,
  Backdrop,
  Menu,
  MenuItem,
} from "@mui/material";
import { ExitToApp } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { Auth, I18n } from "aws-amplify";
import { connect } from "react-redux";
import { updateLoginState } from "../actions/loginAction";
import { updateMenuState } from "../actions/menuAction";

function Navbar(props) {
  const {
    updateLoginState,
    updateMenuState,
    loginState,
    menuEnabled,
    showSideMenuButton,
  } = props;
  const navigate = useNavigate();

  const [user, setUser] = useState("");
  const [loadingBackdrop, setLoadingBackdrop] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    setLoadingBackdrop(true);
    handleMenuClose();
    await new Promise((r) => setTimeout(r, 1000));
    await onSignOut();
    setLoadingBackdrop(false);
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "center" }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleLogout}>
        <span>{I18n.get("logout")}</span>
        <ExitToApp color={"secondary"} />
      </MenuItem>
    </Menu>
  );

  useEffect(() => {
    async function retrieveUser() {
      try {
        const returnedUser = await Auth.currentAuthenticatedUser();
        setUser(returnedUser.attributes.email);
      } catch (e) {
        console.log(e);
      }
    }
    retrieveUser();
  }, [loginState]);

  const handleSideMenu = () => {
    updateMenuState(!menuEnabled);
  };

  async function onSignOut() {
    updateLoginState("signIn");
    navigate("/");
    await Auth.signOut();
  }

  return (
    <Grid item xs={12}>
      <AppBar
        position="relative"
        sx={{
          backgroundColor: "#012144",
          zIndex: 1400,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {showSideMenuButton ? (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={handleSideMenu}
              >
                <MenuIcon />
              </IconButton>
            ) : null}
            <Typography
              variant="h6"
              component={"h1"}
              noWrap
              sx={{ fontWeight: 200 }}
            >
              {I18n.get("title")}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <div>
              <IconButton
                edge="end"
                aria-label="account of current user"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <Avatar>{user.charAt(0).toUpperCase()}</Avatar>
              </IconButton>
            </div>
            <div>{renderMenu}</div>
          </Box>
        </Toolbar>
      </AppBar>
      <Backdrop open={loadingBackdrop}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Grid>
  );
}

const mapStateToProps = (state) => {
  return {
    loginState: state.loginState.currentState,
    menuEnabled: state.appState.showSideBar,
  };
};

const mapDispatchToProps = {
  updateLoginState,
  updateMenuState,
};

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
