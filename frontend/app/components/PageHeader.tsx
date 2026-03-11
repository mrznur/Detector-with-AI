export default function PageHeader({ title }: { title: string }) {
  return (
    <header className="border-b pb-4">
      <h1 className="text-2xl font-bold">{title}</h1>
    </header>
  );
}
