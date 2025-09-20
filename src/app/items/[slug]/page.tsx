import { ItemDetail } from "@/app/items/_components/detail/item-detail";

export default async function ItemPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  return <ItemDetail slug={slug} />;
}
