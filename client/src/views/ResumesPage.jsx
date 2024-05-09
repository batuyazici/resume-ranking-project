import { useState } from "react";
import Dropzone from "../components/Dropzone";
import ResumeExtraction from "../components/ResumeExtraction"; 
import NavBar from "../components/Navbar";
import Footer from "../components/Footer";
function ResumesPage() {
  const [currentStep, setCurrentStep] = useState("upload");

  const handleStepChange = (step) => {
    setCurrentStep(step);
  };

  return (
    <>
      <NavBar />
      {currentStep === "upload" ? (
        <Dropzone onStepChange={() => handleStepChange("detect")} />
      ) : currentStep === "detect" ? (
        <ResumeExtraction onStepChange={handleStepChange} />
      ) : null}
      <Footer />
    </>
  );
}
export default ResumesPage;
