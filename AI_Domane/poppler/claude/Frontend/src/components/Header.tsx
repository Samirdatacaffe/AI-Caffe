import { useState, useRef, useEffect } from 'react';
import type { NavItemType } from '../types';
import { ChevronDownIcon } from './icons';
import aicaffeLogo from '../assets/aicaffe-logo.png';
import { useTheme } from '../context/ThemeContext';
import styles from './Header.module.css';

interface DropdownColumn {
  title: string;
  items: string[];
}

interface DropdownData {
  columns: DropdownColumn[];
}

const DROPDOWN_MENUS: Record<string, DropdownData> = {
  Solutions: {
    columns: [
      { title: 'Use cases', items: ['AI agents', 'AICaffe Code Security', 'Coding'] },
      { title: 'Industries', items: ['Customer support', 'Education', 'Financial services', 'Government'] },
      { title: '', items: ['Healthcare', 'Life sciences', 'Nonprofits'] },
    ],
  },
};

const NAV_ITEMS: NavItemType[] = [
  { label: 'Meet AICaffe', hasDropdown: true },
  { label: 'Platform', hasDropdown: true },
  { label: 'Solutions', hasDropdown: true },
  { label: 'Pricing', hasDropdown: true },
  { label: 'Resources', hasDropdown: true },
];

const SunIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

interface HeaderProps {
  onLogoClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNavClick = (label: string) => {
    if (DROPDOWN_MENUS[label]) {
      setOpenMenu(openMenu === label ? null : label);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo} onClick={onLogoClick} style={{ cursor: onLogoClick ? 'pointer' : 'default' }}>
        <img src={aicaffeLogo} alt="AICaffe" style={{ height: 32, objectFit: 'contain' }} />
        <span className={styles.logoText}>AICaffe</span>
      </div>

      <nav className={styles.nav} ref={navRef}>
        {NAV_ITEMS.map((item: NavItemType) => (
          <div key={item.label} className={styles.navItemWrapper}>
            <button
              className={`${styles.navItem} ${openMenu === item.label ? styles.navItemActive : ''}`}
              onClick={() => handleNavClick(item.label)}
            >
              {item.label}
              {item.hasDropdown && <ChevronDownIcon size={14} />}
            </button>

            {openMenu === item.label && DROPDOWN_MENUS[item.label] && (
              <div className={styles.dropdown}>
                {DROPDOWN_MENUS[item.label].columns.map((col: DropdownColumn, i: number) => (
                  <div key={i} className={styles.dropdownCol}>
                    {col.title && <span className={styles.dropdownTitle}>{col.title}</span>}
                    <ul className={styles.dropdownList}>
                      {col.items.map((text: string) => (
                        <li key={text} className={styles.dropdownItem}>{text}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className={styles.actions}>
        <button className={styles.themeToggle} onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>
    </header>
  );
};

export default Header;
