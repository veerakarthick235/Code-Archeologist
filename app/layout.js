import './globals.css'

export const metadata = {
  title: 'CodeArcheologist',
  description: 'A simple template with App Router, MongoDB, and shadcn/ui',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
