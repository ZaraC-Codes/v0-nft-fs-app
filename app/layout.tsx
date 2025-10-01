import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { AuthProvider } from "@/components/auth/auth-provider"
import { ProfileProvider } from "@/components/profile/profile-provider"
import { WalletSwitcherProvider } from "@/components/wallet/wallet-switcher"
import { ThirdwebProvider } from "thirdweb/react"
import { Toaster } from "@/components/ui/toaster"
import { LoadingPage } from "@/components/loading-page"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Fortuna Square - Digital Marketplace",
  description: "Discover, collect, and trade unique NFTs in the premier digital marketplace",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        <Suspense fallback={<LoadingPage />}>
          <ThirdwebProvider>
            <AuthProvider>
              <ProfileProvider>
                <WalletSwitcherProvider>
                  {children}
                  <Toaster />
                </WalletSwitcherProvider>
              </ProfileProvider>
            </AuthProvider>
          </ThirdwebProvider>
        </Suspense>
      </body>
    </html>
  )
}
