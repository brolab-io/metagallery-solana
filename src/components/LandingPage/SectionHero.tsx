"use client";
/* eslint-disable @next/next/no-img-element */
import { useWallet } from "@solana/wallet-adapter-react";
import Button from "../__UI/Button";
import Container from "../__UI/Container";

const SectionHero = () => {
  const { connected } = useWallet();
  return (
    <div className="min-h-[calc(100vh-108px)] w-full aspect-video bg-[url(/assets/images/section.jpg)] relative">
      <div className="absolute inset-x-0 aspect-video">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="object-cover w-full h-full"
          src="/assets/videos/banner.mp4"
        />
      </div>
      <div className="absolute inset-0">
        <Container className="relative flex h-full">
          <div className="flex flex-col justify-center">
            <h1 className="uppercase font-bold text-primary text-[80px]">META GALLERY</h1>{" "}
            <h2 className="uppercase font-bold text-white text-[80px] -mt-6">
              DISPLAY NFTS IN METAVERSE
            </h2>
            <div className="mt-8 space-x-5">
              {!connected && <Button>Connect Wallet</Button>}
              <Button href="/explore" outlined>
                EXPLORE
              </Button>
            </div>
          </div>
        </Container>
        {/* <div className="absolute bottom-0 right-0 ">
          <img src="/assets/images/hero.png" className="w-[728px]" alt="hero" />
        </div> */}
      </div>
    </div>
  );
};

export default SectionHero;
