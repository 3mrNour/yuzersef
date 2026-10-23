import { Hero } from "../sections/Hero";
import { Services } from "../sections/Services";
import { StudioTeaser } from "../sections/StudioTeaser";
import { Process } from "../sections/Process";
import { Portfolio } from "../sections/Portfolio";
import { About } from "../sections/About";
import { Faq } from "../sections/Faq";
import { Contact } from "../sections/Contact";

export function Home() {
  return (
    <>
      <Hero />
      <Services />
      <StudioTeaser />
      <Process />
      <Portfolio />
      <About />
      <Faq />
      <Contact />
    </>
  );
}
