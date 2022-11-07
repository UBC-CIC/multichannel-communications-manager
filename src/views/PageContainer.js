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
} from "@mui/material";
import { Home } from "@mui/icons-material";
import Navbar from "../components/Navbar";
import Landing from "../pages/Landing";

// const theme = createMuiTheme();

// const useStyles = makeStyles((theme) => ({
//   root: {
//     display: "flex",
//   },
//   list: {
//     width: 250,
//   },
//   fullList: {
//     width: "auto",
//   },
//   drawer: {
//     width: 240,
//     flexShrink: 0,
//   },
//   drawerContainer: {
//     overflow: "auto",
//   },
//   drawerPaper: {
//     width: 240,
//   },
//   content: {
//     flexGrow: 1,
//     [theme.breakpoints.down("sm")]: {
//       padding: theme.spacing(3),
//     },
//   },
// }));

function PageContainer(props) {
  const { menuEnabled, updateMenuState } = props;
  const navigate = useNavigate();

  // const classes = useStyles();
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

  //   {
  //     /* Example side menu is provided below */
  //   }
  const list = () => (
    <div
      // className={classes.drawerContainer}
      onClick={handleSideMenuClose(false)}
      onKeyDown={handleSideMenuClose(false)}
    >
      <List>
        <ListItem button key={"home"} onClick={() => navigate("/")}>
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          <ListItemText primary={"Home"} />
        </ListItem>
      </List>
    </div>
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
          style={{ zIndex: 2 }}
          // classes={{
          //   paper: classes.drawerPaper,
          // }}
          ModalProps={{ onBackdropClick: handleSideMenuClose() }}
        >
          <Toolbar />
          {/* Side menu items added for rendering */}
          {list()}
        </Drawer>
        <main>
          {/* Routes are added here if you need multiple page views. otherwise this Switch can be deleted and replaced
                with your app's contents */}

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
