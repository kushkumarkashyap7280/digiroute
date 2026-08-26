import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ digipin: string }>;
}

export default async function CardRedirectPage({ params }: Props) {
  const { digipin } = await params;
  redirect(`/digipin/${digipin}`);
}
