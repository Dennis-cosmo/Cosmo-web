import Image from "next/image";

interface LogoPrincipalProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function LogoPrincipal({
  className = "",
  width = 200,
  height = 45,
}: LogoPrincipalProps) {
  return (
    <Image
      src="/assets/Icons/LogoPrincipal.svg"
      alt="Cosmo Logo"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
