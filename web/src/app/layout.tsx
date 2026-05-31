import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Medico.AI — Save on Medicine Costs",
  description:
    "AI-powered prescription decoder & generic medicine cost optimizer for India. Upload prescriptions, find cheaper alternatives, save up to 80%.",
  keywords: ["medicine", "generic", "prescription", "OCR", "India", "pharmacy", "savings"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} h-full`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 antialiased">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="bg-gray-900 text-gray-400 text-center py-5 text-sm">
            Made with ❤️ for India &nbsp;|&nbsp;{" "}
            <span className="text-emerald-400 font-bold">Medico.AI</span>{" "}
            &nbsp;|&nbsp; Always consult your doctor before switching medicines
          </footer>
        </Providers>
      </body>
    </html>
  );
}
