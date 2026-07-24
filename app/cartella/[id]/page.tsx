import { notFound } from "next/navigation";
import DriveView from "@/components/DriveView";
import { getItem, getChildren, getBreadcrumb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CartellaPage({
  params,
}: {
  params: { id: string };
}) {
  const folder = await getItem(params.id);

  if (!folder || folder.type !== "folder") {
    notFound();
  }

  const [items, breadcrumb] = await Promise.all([
    getChildren(params.id),
    getBreadcrumb(params.id),
  ]);

  return (
    <DriveView
      folderId={params.id}
      title={folder!.name}
      items={items}
      breadcrumb={breadcrumb}
    />
  );
}
