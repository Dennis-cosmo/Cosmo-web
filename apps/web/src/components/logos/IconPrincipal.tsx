import Image from "next/image";

interface IconPrincipalProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function IconPrincipal({
  className = "",
  width = 40,
  height = 40,
}: IconPrincipalProps) {
  return (
    <Image
      src="/assets/Icons/IconPrincipal.svg"
      alt="Cosmo Icon"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}
