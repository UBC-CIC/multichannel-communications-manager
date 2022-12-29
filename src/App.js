import "./App.css";
import { StyledEngineProvider } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import { Amplify, I18n } from "aws-amplify";
import awsmobile from "./aws-exports";
import { Hub } from "aws-amplify";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { updateLoginState } from "./actions/loginAction";
import theme from "./themes";
import Login from "./components/Authentication/Login_material";
import PageContainer from "./views/PageContainer";
import Admin from "./pages/Admin";
import Navbar from "./components/Navbar";
import en from "./components/localization/en.json";
import fr from "./components/localization/fr.json";
import { languageData } from "./components/localization/languageData";

Amplify.configure(awsmobile);

I18n.putVocabularies(languageData);

function App(props) {
  const { loginState, updateLoginState } = props;
  const [language, setLanguage] = useState("fr");
  I18n.setLanguage(language);
  console.log("current navigator language: ", navigator.language);

  const [currentLoginState, updateCurrentLoginState] = useState(loginState);

  useEffect(() => {
    setAuthListener();
  }, []);

  useEffect(() => {
    updateCurrentLoginState(loginState);
  }, [loginState]);

  async function setAuthListener() {
    Hub.listen("auth", (data) => {
      switch (data.payload.event) {
        case "signOut":
          updateLoginState("signIn");
          break;
        default:
          break;
      }
    });
  }

  return (
    // <LocalizationProvider>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <div style={{ width: "100vw", height: "100vh", overflowX: "hidden" }}>
          {currentLoginState !== "signedIn" &&
            currentLoginState !== "Admin" && (
              /* Login component options:
               *
               * [logo: "custom", "none"]
               * [type: "video", "image", "static"]
               * [themeColor: "standard", "#012144" (color hex value in quotes) ]
               *  Suggested alternative theme colors: #037dad, #5f8696, #495c4e, #4f2828, #ba8106, #965f94
               * [animateTitle: true, false]
               * [title: string]
               * [darkMode (changes font/logo color): true, false]
               * [disableSignUp: true, false]
               * */
              <Login
                logo={"custom"}
                type={"image"}
                themeColor={"standard"}
                animateTitle={false}
                title={"ISED"}
                darkMode={true}
                disableSignUp={true}
              />
            )}
          {currentLoginState === "signedIn" && (
            <BrowserRouter>
              <PageContainer />
            </BrowserRouter>
          )}
          {currentLoginState === "Admin" && (
            <BrowserRouter>
              <Navbar showSideMenuButton={false} />
              <main style={{ flexGrow: 1, padding: "50px" }}>
                <Admin />
              </main>
            </BrowserRouter>
          )}
        </div>
      </ThemeProvider>
    </StyledEngineProvider>
    // </LocalizationProvider>
  );
}

const mapStateToProps = (state) => {
  return {
    loginState: state.loginState.currentState,
  };
};

const mapDispatchToProps = {
  updateLoginState,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
