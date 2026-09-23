/**
 * Sign-In Route Layout
 *
 * Overrides the root layout for the /sign-in route to suppress the global
 * site header and footer navigation. The sign-in page is a standalone
 * authentication surface — no public navigation should appear here.
 */
export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
