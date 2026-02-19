import React from 'react'
import Header from './Header'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      <main className="w-full max-w-screen-2xl mx-auto px-8 py-12">{children}</main>
      <footer className="w-full bg-gray-100 text-gray-600 py-4 px-6 text-center">
        {/* Footer content here */}
        &copy; {new Date().getFullYear()} Bastion OS
      </footer>
    </div>
  )
}
