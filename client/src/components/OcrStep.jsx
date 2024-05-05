import { Button, Container } from "react-bootstrap";
import PropTypes from "prop-types";
import { ArrowLeftCircle } from "react-bootstrap-icons";

function OcrStep({ onStepChange }) {
  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-center">
        <Button
          variant="outline-dark"
          className="mt-3"
          size="lg"
          onClick={() => onStepChange("detect")}
          style={{ width: "200px" }}
        >
          Return to Detection <ArrowLeftCircle size={25} />
        </Button>
      </div>
    </Container>
  );
}

OcrStep.propTypes = {
  onStepChange: PropTypes.func.isRequired,
};

export default OcrStep;
