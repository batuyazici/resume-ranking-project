import NavBar from '../components/Navbar';
import Footer from '../components/Footer';
import Createjob from '../components/CreateJob';
import { Helmet } from 'react-helmet-async';
function JobsPage() {
  return (
    <>
      <Helmet>
        <title>Add Jobs</title>
        <meta name="description" content="Adding Jobs" />
      </Helmet>
      <NavBar />
      <Createjob />
      <Footer />
    </>
  )
}
export default JobsPage;