import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth";

/** No landing page: the portal opens on sign-in, or the dashboard if you're already in. */
export default async function Home() {
  const viewer = await getViewer();
  redirect(viewer ? "/dashboard" : "/login");
}
