export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-[1440px] animate-pulse px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-4 w-32 rounded bg-[#dfe8ed]" />
      <div className="mt-4 h-10 w-full max-w-xl rounded bg-[#dfe8ed]" />
      <div className="mt-3 h-5 w-full max-w-2xl rounded bg-[#e7eef2]" />
      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        <div className="h-52 rounded-lg bg-[#e7eef2] lg:col-span-2" />
        <div className="h-52 rounded-lg bg-[#e7eef2]" />
      </div>
      <div className="mt-5 h-72 rounded-lg bg-[#e7eef2]" />
    </div>
  );
}
