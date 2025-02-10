import Layout from "../../components/nav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manger",
  description: "Craft My Plate",
  
};
export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}
