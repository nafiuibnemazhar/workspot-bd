import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white py-12 border-t border-white/10 mt-auto">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="text-2xl font-extrabold text-brand-orange mb-2">
              WorkSpot.
            </h3>
            <p className="text-white/60 text-sm">Find your focus, anywhere.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-white/60">
            <Link
              href="/"
              className="hover:text-brand-orange transition-colors"
            >
              Home
            </Link>
            <Link
              href="/map"
              className="hover:text-brand-orange transition-colors"
            >
              Global Map
            </Link>
            <Link
              href="/gigs"
              className="hover:text-brand-orange transition-colors font-bold text-white/90"
            >
              Remote Jobs
            </Link>
            <Link
              href="/blog"
              className="hover:text-brand-primary transition-colors"
            >
              Journal
            </Link>
            <Link
              href="/add-cafe"
              className="hover:text-brand-orange transition-colors"
            >
              Add Workspace
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 text-center text-xs text-white/40">
          &copy; {new Date().getFullYear()} WorkSpot. Built with Next.js &
          Supabase.
        </div>
      </div>
    </footer>
  );
}
