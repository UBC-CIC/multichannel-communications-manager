import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
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
import { ExitToApp, More } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { Auth } from "aws-amplify";
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
  const [loadingBackdrop, setLoadingBackdrop] = React.useState(false);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleLogout = async () => {
    setLoadingBackdrop(true);
    handleMenuClose();
    await new Promise((r) => setTimeout(r, 1000));
    await onSignOut();
    setLoadingBackdrop(false);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleLogout}>
        <span>Logout </span>
        <ExitToApp color={"secondary"} />
      </MenuItem>
    </Menu>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem disabled>
        <Avatar>{user.charAt(0).toUpperCase()}</Avatar>
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <span>Logout </span>
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
      <AppBar position="static" style={{ backgroundColor: "#012144" }}>
        <Toolbar>
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
            ISED
          </Typography>
          <div />
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
          <div>
            <IconButton
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <More />
            </IconButton>
            {renderMobileMenu}
            {renderMenu}
          </div>
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
