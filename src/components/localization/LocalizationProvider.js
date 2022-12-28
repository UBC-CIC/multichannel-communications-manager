import React, { useState } from "react";
import { strings } from "./strings";

const LocalizationContext = React.createContext();
const LocalizationProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");
  strings.setLanguage(language);
  return (
    <LocalizationContext.Provider value={{ language, setLanguage }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export default LocalizationProvider;
