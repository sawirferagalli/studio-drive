import Link from "next/link";
import { notFound } from "next/navigation";
import { lavori } from "@/lib/data";

export function generateStaticParams() {
  return lavori.map((cartella) => ({ slug: cartella.slug }));
}

export default function CartellaPage({
  params,
}: {
  params: { slug: string };
}) {
  const cartella = lavori.find((c) => c.slug === params.slug);

  if (!cartella) {
    notFound();
  }

  return (
    <>
      <Link href="/" className="breadcrumb">
        ← Lavori
      </Link>
      <div className="page-head">
        <div>
          <h1>{cartella!.nome}</h1>
          <p>0 elementi</p>
        </div>
      </div>

      <div className="empty-state">
        Questa cartella è vuota. I file verranno aggiunti in un secondo momento.
      </div>
    </>
  );
}
