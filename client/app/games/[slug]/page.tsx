import { redirect } from "next/navigation";
import type { Game } from "../../lib/api";
import { getApiItem } from "../../lib/api";
import { slugify } from "../../lib/slug";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function GameLegacyRedirectPage({ params }: PageProps) {
  const { slug: id } = await params;
  const game = await getApiItem<Game>("/games", id);

  if (!game) {
    redirect("/games");
  }

  redirect(`/games/${slugify(game.slug || game.title) || id}/${id}`);
}
