import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import headerImg from "../assets/img/Job offers-bro.svg";


const Createjob = () => {
  return (
    <>
    
    <Container className="mt-5">
        
    
      <div className='img-job'>
      <img src={headerImg} alt="Header Img"/>
      </div>
      <Form>
        <Form.Group className="mb-3" controlId="jobTitle">
          <Form.Label>Job Title</Form.Label>
          <Form.Control type="text" placeholder="Enter job title" />
        </Form.Group>

        <Form.Group className="mb-3" controlId="jobDescription">
          <Form.Label>Job Description</Form.Label>
          <Form.Control as="textarea" rows={3} placeholder="Enter job description" />
        </Form.Group>

        <Form.Group className="mb-3" controlId="jobType">
          <Form.Label>Job Type</Form.Label>
          <Form.Select aria-label="Job type select">
            <option>Open this select menu</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="temporary">Temporary</option>
            <option value="internship">Internship</option>
          </Form.Select>
        </Form.Group>

        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </Container>
    
    </>
  );
}

export default Createjob;
