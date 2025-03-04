import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-12 border-t border-t-foreground/10 bg-foreground/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-bold text-lg mb-4">
              <span style={{ color: 'hsl(var(--uganda-gold))' }}>Uganda</span> Digital Infrastructure Mapping
            </h3>
            <p className="text-sm text-foreground/70 max-w-md">
              A comprehensive platform for visualizing and analyzing Uganda's digital infrastructure for strategic planning and development.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li><Link href={"#"} className="hover:text-foreground transition-colors">Documentation</Link></li>
              <li><Link href={"#"} className="hover:text-foreground transition-colors">API Reference</Link></li>
              <li><Link href={"#"} className="hover:text-foreground transition-colors">Support Center</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li><Link href={"#"} className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href={"#"} className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href={"#"} className="hover:text-foreground transition-colors">Data Protection</Link></li>
            </ul>
          </div>
        </div>
        <div className="w-full h-px bg-foreground/10 my-8"></div>
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-foreground/60">
            © {new Date().getFullYear()} Uganda Digital Infrastructure Mapping. All rights reserved.
          </p>
          <p className="text-xs text-foreground/60 mt-2 md:mt-0">
            Powered by{" "}
            <a
              href="https://supabase.com/"
              target="_blank"
              className="hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>{" "}
            and{" "}
            <a
              href="https://nextjs.org/"
              target="_blank"
              className="hover:underline"
              rel="noreferrer"
            >
              Next.js
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}