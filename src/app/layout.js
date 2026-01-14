import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Task Manager',
  description: 'A simple task management application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen">
          {children}
        </main>
        
        <footer className="text-center py-6 text-gray-500 text-sm">
          <p>Task Manager © {new Date().getFullYear()} - Built with Next.js, Prisma & Tailwind CSS</p>
        </footer>
      </body>
    </html>
  )
}