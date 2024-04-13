import Dropzone from '../components/Dropzone';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';
import '../assets/css/ResumesPage.css';
import "bootstrap/dist/css/bootstrap.min.css";

function ResumesPage() {
  return (
    <>
    <NavBar></NavBar>
      <Dropzone />
      <Footer></Footer>
    </>
  )
}
export default ResumesPage;