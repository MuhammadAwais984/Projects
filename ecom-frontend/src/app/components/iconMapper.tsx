import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import LaptopIcon from "@mui/icons-material/Laptop";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import WatchIcon from "@mui/icons-material/Watch";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag"; // default
import { JSX } from "@emotion/react/jsx-runtime";
import Image from "next/image";
import { ElectricalServices } from "@mui/icons-material";

export function getCategoryIcon(categoryName: string): JSX.Element {
  const lower = categoryName.toLowerCase();

  if (lower.includes("phone")) return <PhoneIphoneIcon fontSize="large" />;
  if (lower.includes("clothe")) return <CheckroomIcon fontSize="large" />;
  if (lower.includes("laptop") || lower.includes("computer"))
    return <LaptopIcon fontSize="large" />;
  if (lower.includes("game")) return <SportsEsportsIcon fontSize="large" />;
    if (lower.includes("electronics")) return <ElectricalServices fontSize="large" />;
  if (lower.includes("watch")) return <WatchIcon fontSize="large" />;

   if (lower.includes("perfumes"))
    return (
      <Image
        src="/icons/delicate-perfume-svgrepo-com.svg"
        alt="Fragrance"
        width={40}
        height={40}
      />
    );
    if (lower.includes("kitchen"))
    return (
      <Image
        src="/icons/kitchen-knives-svgrepo-com.svg"
        alt="kitcheb=n"
        width={40}
        height={40}
      />
    );
  if (lower.includes("shoes"))
    return (
      <Image
        src="/icons/sports-shoes-2-svgrepo-com.svg"
        alt="Shoes"
        width={40}
        height={40}
      />
    );
     if (lower.includes("exercise"))
    return (
      <Image
        src="/icons/exercise-svgrepo-com.svg"
        alt="kitcheb=n"
        width={40}
        height={40}
      />
    );

  // fallback
  return <ShoppingBagIcon fontSize="large" />;
}
