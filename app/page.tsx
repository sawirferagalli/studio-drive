import DriveView from "@/components/DriveView";
import { getChildren } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DrivePage() {
  const items = await getChildren(null);
  return (
    <DriveView folderId={null} title="Drive" items={items} breadcrumb={[]} />
  );
}
