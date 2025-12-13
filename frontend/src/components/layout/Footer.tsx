export function Footer() {
  return (
    <footer className="border-t bg-card/50 py-6 mt-auto">
      <div className="container text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} STEM Bootcamp. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
