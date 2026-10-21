import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import Theme from './utils/theme';
import reportWebVitals from './reportWebVitals';
import { Amplify } from 'aws-amplify';
import { loadAmplifyOutputs } from './utils/amplifyOutputs';
import "@aws-amplify/ui-react/styles.css";
import "./css/tokens.css";
import "./css/animations.css";
import "./css/design-system.css";
import "./css/modal.css";
import "./css/requests.css";

Amplify.configure(loadAmplifyOutputs() as Parameters<typeof Amplify.configure>[0]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ThemeProvider theme={Theme.light}><App /></ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
