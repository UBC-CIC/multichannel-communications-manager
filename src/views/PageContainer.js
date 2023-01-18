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
import { NotificationsNone, Person } from "@mui/icons-material";
import Navbar from "../components/Navbar";
import SubscribeToTopics from "../pages/SubscribeToTopics";
import EditAccountInfo from "../pages/EditAccountInfo";
import { I18n } from "aws-amplify";

function PageContainer(props) {
  const { menuEnabled, updateMenuState, language, setLanguage } = props;
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
            <NotificationsNone />
          </ListItemIcon>
          <ListItemText primary={I18n.get("subscribeTab")} />
        </ListItem>
        <ListItem
          button
          key={"edit-account-info"}
          onClick={() => navigate("/edit-account-information")}
        >
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          <ListItemText primary={I18n.get("editAccountTab")} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Grid container direction="column">
      {/* Navbar component, set side menu button parameter -->
        button updates redux state to show/hide left sidebar */}
      <Navbar
        showSideMenuButton={true}
        language={language}
        setLanguage={setLanguage}
      />
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
            <Route
              exact
              path={"/"}
              element={<SubscribeToTopics language={language} />}
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
