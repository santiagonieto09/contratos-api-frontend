export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
        &copy; {new Date().getFullYear()} Contratos API. Todos los derechos reservados.
      </div>
    </footer>
  )
}
