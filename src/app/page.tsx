import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-slate-50 items-center justify-center">
      <Link href="expenses/create">Incluir despesa</Link>
    </div>
  );
}
