import { Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import AnimatedLayout from "./components/layout/AnimatedLayout";
import { PremiereVideoProvider } from "./components/premiereVideoSession";
import Home from "./pages/Home";
import About from "./pages/About";
import NotFoundPage from "./pages/NotFoundPage";
import Services from "./pages/Services";  
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import BottomEffect from "./BottomEffect";
import { useAuth } from "./context/AuthContext";
import Teams from "./pages/Teams";
import Portfolio from "./pages/Portfolio";
import Contact from "./pages/Contact.jsx";
import Admin from "./pages/lib/Admin.jsx";


const ADMIN_PATH = "/kamitsubaki-internal-9f3a";
function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isAdminRoute = location.pathname === ADMIN_PATH;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white text-2xl">
        Loading...
      </div>
    );
  }

  return (
    <PremiereVideoProvider>

      {!isAdminRoute && <div className="base-black" />}

      {!isAdminRoute && <BottomEffect />}

      {!isAdminRoute && <Header />}

      <Routes>

        <Route path={ADMIN_PATH} element={<Admin />} />

        <Route
          path="/"
          element={
            <AnimatedLayout>
              {user ? <Dashboard /> : <Landing />}
            </AnimatedLayout>
          }
        />

        <Route
          path="/home"
          element={
            <AnimatedLayout>
              <Home />
            </AnimatedLayout>
          }
        />

        <Route
          path="/about"
          element={
            <AnimatedLayout>
              <About />
            </AnimatedLayout>
          }
        />

       
        <Route
          path="/dashboard"
          element={
            <AnimatedLayout>
              <Dashboard />
            </AnimatedLayout>
          }
        />
         <Route
            path="/services"
            element={
              <AnimatedLayout>
                <Services />
              </AnimatedLayout>
            }
          />

          <Route
            path="/portfolio"
            element={
              <AnimatedLayout>
                <Portfolio />
              </AnimatedLayout>
            }
          />

          <Route
            path="/contact"
            element={
              <AnimatedLayout>
                <Contact />
              </AnimatedLayout>
            }
          />
        <Route
          path="/teams"
          element={
            <AnimatedLayout>
              <Teams />
            </AnimatedLayout>
          }
        />

      </Routes>

    </PremiereVideoProvider>
  );
}

export default App;