import React from 'react'
import Header from './Header'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col w-full bg-bone">
      {/* Header: full width */}
      <Header />

      {/* Page content: no width constraints here; individual sections handle inner constraints */}
      <div className="flex-1 w-full">{children}</div>

      {/* Footer: full width outer, inner constrained */}
      <footer className="w-full bg-gray-100 text-gray-600 py-4 px-6">
        <div className="max-w-screen-2xl mx-auto px-8 text-center">
          &copy; {new Date().getFullYear()} Bastion OS
        </div>
      </footer>
    </div>
  )
}
