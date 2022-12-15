"use client";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import Container from "./Container";
import Logo from "./Logo";
import { useConnection } from "@solana/wallet-adapter-react";
import { toast } from "react-toastify";
import { getCurrentCluster } from "../../services/util.service";
import Button from "./Button";

const SolanaConnectButton = dynamic(() => import("./SolanaConnectButton"), {
  ssr: false,
  suspense: true,
});

const menus = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Explore",
    href: "/explore",
  },
  {
    title: "Marketplace",
    href: "/marketplace",
  },
  {
    title: "Pools",
    href: "/pools",
  },
  {
    title: "My NFTs",
    href: "/my-assets",
  },
];

function checkActive(href: string, pathname: string | null) {
  if (!pathname) {
    return false;
  }
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
}

const Navbar = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const toasted = useRef(false);

  useEffect(() => {
    if (!toasted.current) {
      setMounted(true);
      toasted.current = true;
      toast.info(`Connected to ${getCurrentCluster()} cluster!`, {
        position: "top-center",
        autoClose: 3000,
      });
    }
  }, []);

  return (
    <div className="h-[108px] fixed inset-x-0 top-0 flex items-center bg-[#141A31] z-40">
      <Container xxxl className="relative flex items-center justify-between w-full">
        <Link href="/">
          <div className="flex items-center space-x-1 md:space-x-2 lg:space-x-3">
            <Logo />
            <div className="text-2xl font-bold leading-7 tracking-normal text-white uppercase lg:text-3xl">
              MetaGallery
            </div>
          </div>
        </Link>
        <div className="absolute inset-y-0 flex items-center space-x-3 font-bold leading-6 text-white uppercase -translate-x-1/2 md:space-x-4 lg:space-x-5 xl:space-x-6 2xl:space-x-8 left-1/2">
          {menus.map((menu, index) => {
            const isActive = checkActive(menu.href, pathname);
            return (
              <Link className="cursor-pointer" key={index} href={menu.href}>
                <span
                  className={clsx(
                    isActive && "text-primary",
                    "font-bold text-[14px] lg:text-[16px] py-2 hover:text-primary transition-colors whitespace-nowrap"
                  )}
                >
                  {menu.title}
                </span>
              </Link>
            );
          })}
          <Button xxs href="/collections" className="rounded-sm whitespace-nowrap">
            Create Collection
          </Button>
        </div>
        {mounted && <SolanaConnectButton />}
      </Container>
    </div>
  );
};

export default Navbar;
