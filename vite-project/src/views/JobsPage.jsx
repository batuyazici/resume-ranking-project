import '../assets/css/JobsPage.css';
import NavBar from '../components/Navbar';
import Footer from '../components/Footer';
import Createjob from '../components/CreateJob';
import "bootstrap/dist/css/bootstrap.min.css";

function JobsPage() {
  return (
    <>
      <NavBar />
      <Createjob />
      <Footer />
    </>
  )
}
export default JobsPage;