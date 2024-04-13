import '../assets/css/MainPage.css';
import NavBar from '../components/Navbar';
import Banner from '../components/Banner';
import Presentation from '../components/Presentation';
import Gallery from '../components/Gallery';
import Footer from '../components/Footer';
import "bootstrap/dist/css/bootstrap.min.css";

function MainPage() {
  return (
    <>
      <NavBar />
      <Banner />
      <Presentation />
      <Gallery />
      <Footer />
    </>
  )
}
export default MainPage;