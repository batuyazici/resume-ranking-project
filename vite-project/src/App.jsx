import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ResumesPage from "./views/ResumesPage";
import JobsPage from "./views/JobsPage";
import MainPage from "./views/MainPage";

function App() {
  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/cvs" element={<ResumesPage/>} />
        </Routes>  
      </BrowserRouter>
    </>
  );
}

export default App;
