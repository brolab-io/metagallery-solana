import Image from "next/image";

const Logo = () => {
  return (
    <div className="w-9 h-9 lg:w-10 lg:h-10">
      <Image src="/logo.png" width={40} height={40} alt="Logo" quality={100} />
    </div>
  );
};

export default Logo;
