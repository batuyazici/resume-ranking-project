import { useState } from "react";
import Dropzone from "../components/Dropzone";
import DetectionStep from "../components/DetectionStep"; // Assuming this is the detection component
import NavBar from "../components/Navbar";
import Footer from "../components/Footer";
import OcrStep from "../components/OcrStep";
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
        <DetectionStep onStepChange={handleStepChange} />
      ) : currentStep === "ocr" ? (
        <OcrStep onStepChange={handleStepChange} />
      ) : null}
      <Footer />
    </>
  );
}
export default ResumesPage;
