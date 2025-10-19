import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-bold"><img src="bulat.png" alt="" /></span>
              </div>
              <span className="text-xl font-bold text-foreground">FixStore</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 FixieStore<br />
              All rights reserved
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-foreground transition-colors">Homepage</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/?category=all" className="hover:text-foreground transition-colors">All Products</Link></li>
              <li><Link to="/?category=fixie" className="hover:text-foreground transition-colors">New Arrivals</Link></li>
              <li><Link to="/?category=gear" className="hover:text-foreground transition-colors">Best Sellers</Link></li>
              <li><Link to="/sale" className="hover:text-foreground transition-colors">Sale</Link></li>
            </ul>
          </div>

          {/* Admin */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Admin</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link to="/affiliate" className="hover:text-foreground transition-colors">Affiliate Program</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};