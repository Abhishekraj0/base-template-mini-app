import type { Metadata } from "next";

import "~/app/globals.css";
import { Providers } from "~/app/providers";
import { APP_NAME, APP_DESCRIPTION } from "~/lib/constants";
import { AuthProvider } from "~/lib/auth-context";
import { ThemeProvider } from "~/lib/theme-context";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <Providers>{children}</Providers>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
