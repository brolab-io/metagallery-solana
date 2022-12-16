"use client";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { ButtonProps } from "@solana/wallet-adapter-react-ui/lib/types/Button";

const ConnectSolanaButton: React.FC<ButtonProps> = (props) => {
  return <WalletMultiButton {...props} />;
};

export default ConnectSolanaButton;
