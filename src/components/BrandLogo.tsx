import Image from "next/image";
import horizontalLogo from "../../public/Logo1.png";
import stackedLogo from "@/assets/brand/Logo2.png";

export function BrandLogo({ stacked = false }: { stacked?: boolean }) {
  return (
    <Image
      src={stacked ? stackedLogo : horizontalLogo}
      alt="Sterinova"
      width={stacked ? 144 : 190}
      height={stacked ? 141 : 42}
      style={{ width: "auto", height: "auto" }}
      className="mx-auto block h-auto max-w-full object-contain"
    />
  );
}
