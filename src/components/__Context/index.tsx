import { PropsWithChildren } from "react";
import SolanaContextProvider from "./SolanaContext";

const AppContext: React.FC<PropsWithChildren> = ({ children }) => {
  return <SolanaContextProvider>{children}</SolanaContextProvider>;
};

export default AppContext;
