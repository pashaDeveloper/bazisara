import { redirect } from "next/navigation";
import type { Game } from "../../lib/api";
import { getApiItem } from "../../lib/api";
import { gameHref } from "../../lib/content-routes";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function GameLegacyRedirectPage({ params }: PageProps) {
  const { id } = await params;
  const game = await getApiItem<Game>("/games", id);

  if (!game) {
    redirect("/games");
  }

  redirect(gameHref(game));
}
