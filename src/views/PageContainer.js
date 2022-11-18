import React from "react";
import { connect } from "react-redux";
import { Routes, Route, useNavigate } from "react-router-dom";
import { updateMenuState } from "../actions/menuAction";
import {
  Grid,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
} from "@mui/material";
import { Home } from "@mui/icons-material";
import Navbar from "../components/Navbar";
import Landing from "../pages/Landing";

function PageContainer(props) {
  const { menuEnabled, updateMenuState } = props;
  const navigate = useNavigate();

  /*
   * Handles closing side menu if an event occurs
   * */
  const handleSideMenuClose = () => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    updateMenuState(false);
  };

  const list = () => (
    <Box
      onClick={handleSideMenuClose(false)}
      onKeyDown={handleSideMenuClose(false)}
      sx={{ overflow: "auto" }}
    >
      <List>
        <ListItem button key={"home"} onClick={() => navigate("/")}>
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          <ListItemText primary={"Home"} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Grid container direction="column">
      {/* Navbar component, set side menu button parameter -->
        button updates redux state to show/hide left sidebar */}
      <Navbar showSideMenuButton={true} />
      {/* App content example below with sidebar */}
      <Grid item xs={12} className="App-header">
        {/* Side menu component */}
        <Drawer
          anchor={"left"}
          open={menuEnabled}
          onClose={handleSideMenuClose}
          sx={{ zIndex: 2, ".MuiDrawer-paper": { width: 240 } }}
          ModalProps={{ onBackdropClick: handleSideMenuClose() }}
        >
          <Toolbar />
          {/* Side menu items added for rendering */}
          {list()}
        </Drawer>
        <main>
          {/* Routes are added here if you need multiple page views*/}
          <Routes>
            <Route exact path={"/"} element={<Landing />} />
          </Routes>
        </main>
      </Grid>
    </Grid>
  );
}

const mapStateToProps = (state) => {
  return {
    menuEnabled: state.appState.showSideBar,
  };
};

const mapDispatchToProps = {
  updateMenuState,
};

export default connect(mapStateToProps, mapDispatchToProps)(PageContainer);
