import { Provider } from "react-redux";
import { store } from "./store";
import React from "react";
import ThemeProvider from "./utils/ThemeContext";

const Providers = ({ children }) => {
  return (
    <Provider store={store}>
      <ThemeProvider>{children}</ThemeProvider>
    </Provider>
  );
};

export default Providers;

