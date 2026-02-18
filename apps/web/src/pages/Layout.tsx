import React from 'react'
import Header from '../components/Header'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      <main className="flex-1 w-full">{children}</main>
      <footer className="w-full bg-gray-100 text-gray-600 py-4 px-6 text-center">
        {/* Footer content here */}
        &copy; {new Date().getFullYear()} Bastion OS
      </footer>
    </div>
  )
}
