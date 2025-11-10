import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Intelligent Soap Formulation Calculator",
  description: "Create optimal soap recipes with data-driven formulation guidance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {children}
        <footer className="text-center py-4 text-sm text-gray-600 border-t mt-8">
          This project uses data from SoapCalc (soapcalc.net) under fair use for educational and non-commercial purposes.
        </footer>
      </body>
    </html>
  );
}
