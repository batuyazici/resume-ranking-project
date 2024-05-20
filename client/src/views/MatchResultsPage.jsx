import NavBar from '../components/Navbar';
import Footer from '../components/Footer';
import MatchResults from '../components/MatchResults'
import { Helmet } from 'react-helmet-async';

function MatchResultsPage() {
  return (
    <>
      <Helmet>
        <title>Match Results</title>
        <meta name="description" content="View match results" />
      </Helmet>
      <NavBar />
      <MatchResults/>
      <Footer />
    </>
  )
}
export default MatchResultsPage;