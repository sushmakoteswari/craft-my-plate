import Layout from "../../components/nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Craft My Plate",
  
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}
