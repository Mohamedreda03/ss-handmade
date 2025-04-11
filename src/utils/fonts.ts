import { Almarai } from "next/font/google";
import localFont from "next/font/local";

export const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
});

export const blabeloo = localFont({
  src: "../fonts/Blabeloo-font-v.1.0.ttf",
});
