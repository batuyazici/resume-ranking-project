import NavBar from '../components/Navbar';
import Banner from '../components/Banner';
import Presentation from '../components/Presentation';
import Gallery from '../components/Gallery';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';
function MainPage() {
  return (
    <>
      <Helmet>
        <title>Welcome!</title>
        <meta name="description" content="Welcome" />
      </Helmet>
      <NavBar />
      <Banner />
      <Presentation />
      <Gallery />
      <Footer />
    </>
  )
}
export default MainPage;