
import "./globals.css";

export const metadata = {
  title: 'SongMash',
  description: 'Mash any two songs with one click',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        
      >
        {children}
      </body>
    </html>
  );
}
