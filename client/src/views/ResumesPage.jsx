import { useState } from "react";
import Dropzone from "../components/Dropzone";
import DetectionStep from "../components/DetectionStep"; // Assuming this is the detection component
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
      ) : (
        <DetectionStep onStepChange={() => handleStepChange("upload")} />
      )}
      <Footer />
    </>
  );
}
export default ResumesPage;
