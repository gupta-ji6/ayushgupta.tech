import { useEffect, useMemo, useRef, useState } from 'react';

interface NavItem {
  href: string;
  name: string;
}

interface MobileMenuProps {
  items: NavItem[];
}

const KEY_ESCAPE = 'Escape';
const KEY_TAB = 'Tab';

export default function MobileMenu({ items }: MobileMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);

  const menuFocusables = useMemo(() => {
    const links = navRef.current
      ? Array.from(navRef.current.querySelectorAll<HTMLAnchorElement>('a'))
      : [];
    return [buttonRef.current, ...links].filter(Boolean) as HTMLElement[];
  }, [menuOpen]);

  useEffect(() => {
    document.body.classList.toggle('blur', menuOpen);
    return () => document.body.classList.remove('blur');
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === KEY_ESCAPE) {
        setMenuOpen(false);
        buttonRef.current?.focus();
        return;
      }

      if (event.key !== KEY_TAB || menuFocusables.length === 0) {
        return;
      }

      const first = menuFocusables[0];
      const last = menuFocusables[menuFocusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const onResize = () => {
      if (window.innerWidth > 768) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [menuFocusables, menuOpen]);

  useEffect(() => {
    if (menuOpen) {
      navRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    }
  }, [menuOpen]);

  return (
    <div ref={wrapperRef} className="block md:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Menu"
        aria-controls="mobile-nav"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((value) => !value)}
        className="relative z-[15] mr-[-15px] flex h-14 w-14 items-center justify-center border-0 bg-transparent p-3 text-inherit"
      >
        <span className="relative block h-6 w-8">
          <span
            className={`absolute right-0 top-1/2 h-0.5 rounded bg-green transition-all duration-200 ${
              menuOpen ? 'w-8 rotate-[225deg]' : 'w-8 -translate-y-1/2'
            }`}
          />
          <span
            className={`absolute right-0 h-0.5 rounded bg-green transition-all duration-200 ${
              menuOpen ? 'top-1/2 w-8 opacity-0' : 'top-[1px] w-[120%]'
            }`}
          />
          <span
            className={`absolute right-0 h-0.5 rounded bg-green transition-all duration-200 ${
              menuOpen ? 'top-1/2 w-8 -rotate-90' : 'bottom-[1px] w-[80%]'
            }`}
          />
        </span>
      </button>

      <aside
        id="mobile-nav"
        aria-hidden={!menuOpen}
        className={`fixed inset-y-0 right-0 z-[14] flex w-[min(75vw,400px)] flex-col justify-center bg-light-navy px-6 py-12 shadow-[-10px_0px_30px_-15px_rgba(2,12,27,0.7)] transition duration-250 ease-[cubic-bezier(0.645,0.045,0.355,1)] ${
          menuOpen ? 'translate-x-0 visible' : 'translate-x-full invisible'
        }`}
      >
        <nav
          ref={navRef}
          aria-label="Mobile"
          className="text-center font-mono text-lightest-slate"
        >
          <ol className="space-y-4">
            {items.map((item, index) => (
              <li key={item.name} className="text-[clamp(14px,4vw,18px)]">
                <span className="mb-1 block text-sm text-green">
                  0{index + 1}.
                </span>
                <a
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-5 py-2"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ol>

          <a
            href="/resume"
            onClick={() => setMenuOpen(false)}
            className="mt-8 inline-flex rounded border border-green px-8 py-4 text-sm text-green transition hover:-translate-y-1 hover:bg-trans-green"
          >
            Resume
          </a>
        </nav>
      </aside>
    </div>
  );
}
