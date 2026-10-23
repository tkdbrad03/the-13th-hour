import "./globals.css";

export const metadata = {
  title: "The 13th Hour",
  description: "Your shift survival kit — a stress-relief app for nurses.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0f14",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
