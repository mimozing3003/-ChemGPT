import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChemGPT | The Future of Molecular Intelligence",
  description: "AI Chemistry Copilot built by Saumojit Roy",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
