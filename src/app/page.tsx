import SectionAbout from "../components/LandingPage/SectionAbout";
// import SectionCollection from "../components/LandingPage/SectionCollection";
import SectionFAQ from "../components/LandingPage/SectionFAQ";
import SectionHero from "../components/LandingPage/SectionHero";
import SectionHowWeWork from "../components/LandingPage/SectionHowWeWork";
import SectionOurTeam from "../components/LandingPage/SectionOurTeam";

const LandingPage = () => {
  return (
    <>
      <SectionHero />
      <SectionAbout />
      {/* <SectionCollection /> */}
      <SectionHowWeWork />
      <SectionOurTeam />
      <SectionFAQ />
    </>
  );
};

export default LandingPage;
