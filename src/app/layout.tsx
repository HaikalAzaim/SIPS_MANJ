import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/providers/theme-provider"

export const metadata: Metadata = {
  title: "SIPS - Sistem Informasi Pelanggaran Siswa",
  description: "Sistem Informasi Pelanggaran Siswa - Mengelola data pelanggaran, poin, dan laporan siswa",
}

// Inline script: runs BEFORE React hydration to prevent theme flash.
// Reads sips-theme from localStorage and immediately sets class + data-theme.
const themeInitScript = `
(function(){
  try{
    var t=localStorage.getItem('sips-theme');
    var theme=(t==='light')?'light':'dark';
    var root=document.documentElement;
    root.setAttribute('data-theme',theme);
    root.classList.remove('light','dark');
    root.classList.add(theme);
  }catch(e){}
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Anti-flash: apply theme class before first paint */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
