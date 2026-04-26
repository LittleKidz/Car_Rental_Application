export const metadata = {
  title: "API Docs — GoGo Rental",
};

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-white">{children}</div>;
}
