import HeistDetail from "@/components/HeistDetail";

export default async function HeistDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  return (
    <div className="page-content">
      <HeistDetail id={id} />
    </div>
  );
}
