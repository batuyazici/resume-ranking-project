import NavBar from '../components/Navbar';
import Footer from '../components/Footer';
import MatchOperation from '../components/MatchOperation'
import { Helmet } from 'react-helmet-async';

function MatchPage() {
  return (
    <>
      <Helmet>
        <title>Match Jobs</title>
        <meta name="description" content="Adding Jobs" />
      </Helmet>
      <NavBar />
      <MatchOperation />
      <Footer />
    </>
  )
}
export default MatchPage;