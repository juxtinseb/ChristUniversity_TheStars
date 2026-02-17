import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ResourceProvider } from './context/ResourceContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Browse from './pages/Browse';
import Upload from './pages/Upload';
import ResourceDetail from './pages/ResourceDetail';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ResourceProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/resource/:id" element={<ResourceDetail />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </ResourceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
