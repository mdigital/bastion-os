import React from 'react'
import Header from './Header'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col w-full bg-bone">
      <Header />

      <div className="flex-1 w-full">{children}</div>

      <footer className="w-full bg-black text-white py-6 px-6">
        <div className="max-w-screen-2xl mx-auto px-8 text-center">
          Bastion OS • Powered by AI • &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  )
}
