import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ResumesPage from "./views/ResumesPage";
import JobsPage from "./views/JobsPage";
import MainPage from "./views/MainPage";
import MatchPage from "./views/MatchPage";
import MatchResultsPage from "./views/MatchResultsPage";
import ResumeResultsPage from "./views/ResumeResultsPage";
function App() {
  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/cvs" element={<ResumesPage/>} />
        <Route path="/match" element={<MatchPage/>} />
        <Route path="/results/match" element={<MatchResultsPage/>} />
        <Route path="/results/cvs" element={<ResumeResultsPage/>} />
        </Routes>  
      </BrowserRouter>
    </>
  );
}

export default App;
