import { Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import AnimatedLayout from "./components/layout/AnimatedLayout";
import { PremiereVideoProvider } from "./components/premiereVideoSession";
import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import BottomEffect from "./BottomEffect";
import { useAuth } from "./context/AuthContext";
import Teams from "./pages/Teams";

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white text-2xl">
        Loading...
      </div>
    );
  }

  return (
    <PremiereVideoProvider>

      <div className="base-black" />

      <BottomEffect />

      <Header />

      <Routes>

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
          path="/services"
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