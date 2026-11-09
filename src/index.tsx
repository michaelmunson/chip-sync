import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import Theme from './utils/theme';
import reportWebVitals from './reportWebVitals';
import { Amplify } from 'aws-amplify';
import { loadAmplifyOutputs } from './utils/amplifyOutputs';
import { resolveLandingRoute } from './utils/landing';
import "@aws-amplify/ui-react/styles.css";
import "./css/tokens.css";
import "./css/animations.css";
import "./css/design-system.css";
import "./css/modal.css";
import "./css/requests.css";

window.exports = window.exports || {};
window.ReactNativeWebView = window.ReactNativeWebView || undefined;

Amplify.configure(loadAmplifyOutputs() as Parameters<typeof Amplify.configure>[0]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// chipsync.co (plus www. / get., and /landing-page on localhost) serves the marketing site; every other host, including app.chipsync.co, gets the app.
// It's lazy-loaded so the app bundle doesn't carry it, and it never mounts the authenticator.
const landingRoute = resolveLandingRoute(window.location.hostname, window.location.pathname);
const LandingApp = landingRoute ? React.lazy(() => import('./components/landing/LandingApp')) : null;

root.render(
  <React.StrictMode>
    {landingRoute && LandingApp ? (
      <Suspense fallback={null}>
        <LandingApp initialRoute={landingRoute} />
      </Suspense>
    ) : (
      <ThemeProvider theme={Theme.light}><App /></ThemeProvider>
    )}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
