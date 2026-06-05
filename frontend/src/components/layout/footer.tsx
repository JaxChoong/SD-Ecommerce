import { Container } from './container'

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto pb-14 md:pb-0">
      <Container>
        <div className="flex flex-col items-center justify-between gap-4 py-8 text-center md:flex-row md:text-left">
          <p className="text-sm font-semibold">EZShop</p>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} EZShop. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  )
}
