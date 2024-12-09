import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from '@hooks/useTheme';
import Layout from '@components/Layout';
import Home from '@pages/Home';
import MyTeam from '@pages/MyTeam';
import Tournaments from '@pages/Tournaments';
import Statistics from '@pages/Statistics';
import Notifications from '@pages/Notifications';
import Settings from '@pages/Settings';
import Auth from '@pages/Auth';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from '@components/PrivateRoute';

function App() {
  const { theme } = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="my-team" element={<MyTeam />} />
              <Route path="tournaments" element={<Tournaments />} />
              <Route path="statistics" element={<Statistics />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
