export function Footer() {
  return (
    <footer className="border-t border-outline-variant/50 bg-surface-bright">
      <div className="mx-auto max-w-(--breakpoint-2xl) px-4 py-5 text-center text-xs text-on-surface-variant sm:px-6 lg:px-8">
        &copy; {new Date().getFullYear()} Contratos API.
      </div>
    </footer>
  )
}
