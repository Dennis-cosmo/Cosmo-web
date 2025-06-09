import { Metadata } from "next";
import InvestorsLayoutClient from "./layout.client";

export const metadata: Metadata = {
  title: "Investors Dashboard - Cosmo",
  description:
    "Explore sustainable investment opportunities and manage your portfolio",
};

export default function InvestorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InvestorsLayoutClient>{children}</InvestorsLayoutClient>;
}
