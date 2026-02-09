import NewGameClient from "./NewGameClient";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ sourceType?: string }>;
}

export default async function NewGamePage({ searchParams }: Props) {
  const params = await searchParams;
  const sourceType = params.sourceType === "OFFICIAL" ? "OFFICIAL" : "USER";

  return <NewGameClient sourceType={sourceType} />;
}
