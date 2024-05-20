import NavBar from '../components/Navbar';
import Footer from '../components/Footer';
import ResumeResults from '../components/MatchResults'
import { Helmet } from 'react-helmet-async';

function ResumeResultsPage() {
  return (
    <>
      <Helmet>
        <title>Resumes Results</title>
        <meta name="description" content="View resume info extraction results" />
      </Helmet>
      <NavBar />
      <ResumeResults/>
      <Footer />
    </>
  )
}
export default ResumeResultsPage;