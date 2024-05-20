import Col from "react-bootstrap/Col";
import PropTypes from "prop-types";
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

GalleryCard.propTypes = {
  imgUrl: PropTypes.string,
};