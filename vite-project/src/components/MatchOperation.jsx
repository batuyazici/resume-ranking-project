import React from 'react';
import { Container, Row, Col, Card } from "react-bootstrap";

const MatchOperation = () => {
  return (
    <Container fluid="md" className="mt-4 ">
      <Row className="justify-content-center match-container-1">
        <Col md={6}>
          <Card> {/* Removed fixed minHeight for dynamic adjustment */}
            <Card.Body>
              <Card.Title>Container 1</Card.Title>
              <Card.Text>
                This is the first container with some sample text.
              </Card.Text>
              {/* Multiple Nested Cards */}
              <Card className="mt-3">
                <Card.Body>
                  <Card.Title>Nested Container 1</Card.Title>
                  <Card.Text>
                    This nested container is inside Container 1.
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card className="mt-3">
                <Card.Body>
                  <Card.Title>Nested Container 2</Card.Title>
                  <Card.Text>
                    Additional nested container inside Container 1.
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card className="mt-3">
                <Card.Body>
                  <Card.Title>Nested Container 3</Card.Title>
                  <Card.Text>
                    Another nested container inside Container 1.
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card className="mt-3">
                <Card.Body>
                  <Card.Title>Nested Container 4</Card.Title>
                  <Card.Text>
                    This nested container is inside Container 4.
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card className="mt-3">
                <Card.Body>
                  <Card.Title>Nested Container 5</Card.Title>
                  <Card.Text>
                    This nested container is inside Container 5.
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card className="mt-3">
                <Card.Body>
                  <Card.Title>Nested Container 6</Card.Title>
                  <Card.Text>
                    This nested container is inside Container 6.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card> {/* Removed fixed minHeight for dynamic adjustment */}
            <Card.Body>
              <Card.Title>Container 2</Card.Title>
              <Card.Text>
                This is the second container with some sample text.
              </Card.Text>
              {/* Multiple Nested Cards */}
              <Card className="mt-3">
                <Card.Body>
                  <Card.Title>Nested Container 1</Card.Title>
                  <Card.Text>
                    This nested container is inside Container 2.
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card className="mt-3">
                <Card.Body>
                  <Card.Title>Nested Container 2</Card.Title>
                  <Card.Text>
                    Additional nested container inside Container 2.
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card className="mt-3">
                <Card.Body>
                  <Card.Title>Nested Container 3</Card.Title>
                  <Card.Text>
                    Another nested container inside Container 2.
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card className="mt-3">
                <Card.Body>
                  <Card.Title>Nested Container 4</Card.Title>
                  <Card.Text>
                    This nested container is inside Container 4.
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card className="mt-3">
                <Card.Body>
                  <Card.Title>Nested Container 5</Card.Title>
                  <Card.Text>
                    This nested container is inside Container 5.
                  </Card.Text>
                </Card.Body>
              </Card>
              <Card className="mt-3">
                <Card.Body>
                  <Card.Title>Nested Container 6</Card.Title>
                  <Card.Text>
                    This nested container is inside Container 6.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default MatchOperation;
