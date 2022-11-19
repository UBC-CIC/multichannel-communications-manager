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
import {
  Home,
  NotificationsNone,
  EditNotifications,
  Person,
} from "@mui/icons-material";
import Navbar from "../components/Navbar";
import Landing from "../pages/Landing";
import SubscribeToTopics from "../pages/SubscribeToTopics";
import EditNotificationPreferences from "../pages/EditNotificationPreferences";
import EditAccountInfo from "../pages/EditAccountInfo";

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
        <ListItem
          button
          key={"subscribe-to-topics"}
          onClick={() => navigate("/subscribe-to-topics")}
        >
          <ListItemIcon>
            <NotificationsNone />
          </ListItemIcon>
          <ListItemText primary={"Subscribe to Topics"} />
        </ListItem>
        <ListItem
          button
          key={"edit-notif-preferences"}
          onClick={() => navigate("/edit-notif-preferences")}
        >
          <ListItemIcon>
            <EditNotifications />
          </ListItemIcon>
          <ListItemText primary={"Edit Notification Preferences"} />
        </ListItem>
        <ListItem
          button
          key={"edit-account-info"}
          onClick={() => navigate("/edit-account-information")}
        >
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          <ListItemText primary={"Edit Account Information"} />
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
      <Grid item xs={12}>
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
        <main style={{ flexGrow: 1, padding: "50px" }}>
          {/* Routes are added here if you need multiple page views*/}
          <Routes>
            <Route exact path={"/"} element={<Landing />} />
            <Route
              exact
              path={"/subscribe-to-topics"}
              element={<SubscribeToTopics />}
            />
            <Route
              exact
              path={"/edit-notif-preferences"}
              element={<EditNotificationPreferences />}
            />
            <Route
              exact
              path={"/edit-account-information"}
              element={<EditAccountInfo />}
            />
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
