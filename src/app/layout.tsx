import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import AppContext from "../components/__Context";
import Footer from "../components/__UI/Footer";
import Navbar from "../components/__UI/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        <AppContext>
          <Navbar />
          <main className="py-[108px] bg-[#0C1226] min-h-screen">
            <>{children}</>
          </main>
          <Footer />
        </AppContext>
      </body>
    </html>
  );
}
