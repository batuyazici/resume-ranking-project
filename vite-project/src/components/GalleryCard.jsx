import Col from "react-bootstrap/Col";

export const GalleryCard = ({ imgUrl }) => {
  return (
    <Col sm={6} md={4}>
      <div className="proj-imgbx">
        <img src={imgUrl} />
      </div>
    </Col>
  );
};

export default GalleryCard;
