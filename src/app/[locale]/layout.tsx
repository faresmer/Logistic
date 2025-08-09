//This file is required for Next.js to not throw an error, but the root layout is now in the main app/layout.tsx
// All styling and metadata is handled there.
export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
