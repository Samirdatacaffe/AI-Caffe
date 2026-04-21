import { useState } from 'react';
import type { PricingTab, IndividualPlan, TeamPlan } from '../types/pricing';
import styles from './PricingSection.module.css';

// ==================== SVG Icons for Plans ====================

const FreeIcon: React.FC = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ color: 'var(--icon-color)' }}>
    <circle cx="20" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
    <path d="M20 16v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M14 28c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="20" cy="8" r="2" fill="currentColor" />
    <path d="M16 10l-4 4M24 10l4 4M20 8V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ProIcon: React.FC = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ color: 'var(--icon-color)' }}>
    <path d="M20 6v4M20 30v4M10 12l3 3M27 27l3 3M6 20h4M30 20h4M10 28l3-3M27 13l3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="20" cy="20" r="6" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="20" cy="20" r="2.5" fill="currentColor" />
  </svg>
);

const MaxIcon: React.FC = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ color: 'var(--icon-color)' }}>
    <path d="M20 6v28M12 10v20M28 10v20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="20" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="28" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 18h16M12 24h16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="2 3" />
  </svg>
);

const TeamIcon: React.FC = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ color: 'var(--icon-color)' }}>
    <rect x="8" y="8" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    <rect x="8" y="20" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    <rect x="22" y="8" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    <rect x="22" y="20" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M10 12h6M10 14h4M10 24h6M10 26h4M24 12h6M24 14h4M24 24h6M24 26h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

const EnterpriseIcon: React.FC = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ color: 'var(--icon-color)' }}>
    <rect x="10" y="12" width="20" height="22" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <rect x="15" y="6" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    <path d="M15 18h10M15 23h10M15 28h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M20 6V4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const CheckIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M4 9.5L7.5 13L14 5.5" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ==================== Data ====================

const INDIVIDUAL_PLANS: IndividualPlan[] = [
  {
    id: 'free',
    icon: <FreeIcon />,
    name: 'Free',
    subtitle: 'Try AICaffe',
    price: '$0',
    priceNote: 'Free for everyone',
    buttonLabel: 'Try AICaffe',
    features: [
      { text: 'Chat on web, iOS, Android, and on your desktop' },
      { text: 'Generate code and visualize data' },
      { text: 'Write, edit, and create content' },
      { text: 'Analyze text and images' },
      { text: 'Ability to search the web' },
      { text: 'Create files and execute code' },
      { text: 'Unlock more from AICaffe with desktop extensions' },
      { text: 'Connect Slack and Google Workspace services' },
      { text: 'Integrate any context or tool through connectors with remote MCP' },
      { text: 'Extended thinking for complex work' },
    ],
  },
  {
    id: 'pro',
    icon: <ProIcon />,
    name: 'Pro',
    subtitle: 'For everyday productivity',
    price: '$17',
    priceNote: 'Per month with annual subscription discount ($200 billed up front). $20 if billed monthly.',
    buttonLabel: 'Try AICaffe',
    featuresTitle: 'Everything in Free, plus:',
    features: [
      { text: 'More usage*' },
      { text: 'AICaffe Code' },
      { text: 'Cowork' },
      { text: 'Unlimited projects' },
      { text: 'Access to Research' },
      { text: 'Memory across conversations' },
      { text: 'More AICaffe models' },
      { text: 'AICaffe in Excel' },
      { text: 'AICaffe in Chrome' },
    ],
    highlighted: true,
  },
  {
    id: 'max',
    icon: <MaxIcon />,
    name: 'Max',
    subtitle: '5-20x more usage than Pro',
    price: 'From $100',
    priceNote: 'Per month billed monthly',
    buttonLabel: 'Try AICaffe',
    featuresTitle: 'Everything in Pro, plus:',
    features: [
      { text: 'Choose 5x or 20x more usage than Pro*' },
      { text: 'Higher output limits for all tasks' },
      { text: 'Early access to advanced AICaffe features' },
      { text: 'Priority access at high traffic times' },
      { text: 'AICaffe in PowerPoint' },
    ],
    highlighted: true,
  },
];

const TEAM_PLANS: TeamPlan[] = [
  {
    id: 'team',
    icon: <TeamIcon />,
    name: 'Team',
    subtitle: 'Predictable usage per seat',
    usersBadge: '5-150 users',
    seats: [
      {
        label: 'Standard seat',
        price: 'USD 20 /mo',
        note: 'All AICaffe features, plus more usage than Pro*\nUSD 25 /mo when billed monthly',
      },
      {
        label: 'Premium seat',
        price: 'USD 100 /mo',
        note: '5x more usage than standard seats*\nUSD 125 /mo when billed monthly',
      },
    ],
    buttonLabel: 'Get Team plan',
    features: [
      { text: '200K context window' },
      { text: 'Extra usage available at API rates' },
      { text: 'AICaffe Code' },
      { text: 'Cowork' },
      { text: 'Central billing and administration' },
      { text: 'Single sign-on (SSO) and domain capture' },
      { text: 'Admin controls for remote and local connectors' },
      { text: 'Enterprise deployment for the AICaffe desktop app' },
      { text: 'Enterprise search across your organization' },
      { text: 'Connect Microsoft 365, Slack, and more' },
      { text: 'No model training on your content by default' },
    ],
  },
  {
    id: 'enterprise',
    icon: <EnterpriseIcon />,
    name: 'Enterprise',
    subtitle: 'Flexible pooled usage',
    usersBadge: '20+ users',
    seats: [
      {
        label: 'Seat price + usage at API rates',
        price: '',
        note: '$20/seat. Usage cost scales with model and task.',
      },
    ],
    buttonLabel: 'Get Enterprise plan',
    featuresTitle: 'All Team features, plus:',
    features: [
      { text: 'Pay-as-you-go pricing with pooled usage across your org' },
      { text: 'Set user and org spend limits' },
      { text: '500K context window' },
      { text: 'Role-based access with fine grained permissioning' },
      { text: 'System for Cross-domain Identity Management (SCIM)' },
      { text: 'Audit logs' },
      { text: 'Compliance API for observability and monitoring' },
      { text: 'Network-level access control' },
      { text: 'Custom data retention controls' },
      { text: 'IP allowlisting' },
      { text: 'Google Docs cataloging' },
    ],
    highlighted: true,
  },
];

// ==================== Sub-components ====================

const IndividualCard: React.FC<{ plan: IndividualPlan }> = ({ plan }) => (
  <div className={`${styles.card} ${plan.highlighted ? styles.cardHighlighted : ''}`}>
    <div className={styles.cardIcon}>{plan.icon}</div>
    <h3 className={styles.planName}>{plan.name}</h3>
    <p className={styles.planSubtitle}>{plan.subtitle}</p>

    <div className={styles.priceBlock}>
      <span className={styles.price}>{plan.price}</span>
      <p className={styles.priceNote}>{plan.priceNote}</p>
    </div>

    <button className={styles.planBtn}>{plan.buttonLabel}</button>

    <div className={styles.divider} />

    {plan.featuresTitle && (
      <p className={styles.featuresTitle}>{plan.featuresTitle}</p>
    )}

    <ul className={styles.featureList}>
      {plan.features.map((f, i) => (
        <li key={i} className={styles.featureItem}>
          <CheckIcon />
          <span>{f.text}</span>
        </li>
      ))}
    </ul>

    {/* Bottom spacer to align cards */}
    <div className={styles.cardBottomSpacer} />
  </div>
);

const TeamCard: React.FC<{ plan: TeamPlan }> = ({ plan }) => (
  <div className={`${styles.card} ${styles.teamCard} ${plan.highlighted ? styles.cardHighlighted : ''}`}>
    <div className={styles.cardTopRow}>
      <div className={styles.cardIcon}>{plan.icon}</div>
      <span className={styles.usersBadge}>{plan.usersBadge}</span>
    </div>

    <h3 className={styles.planName}>{plan.name}</h3>
    <p className={styles.planSubtitle}>{plan.subtitle}</p>

    {plan.seats && plan.seats.map((seat, i) => (
      <div key={i} className={styles.seatRow}>
        <div className={styles.seatHeader}>
          <span className={styles.seatLabel}>{seat.label}</span>
          {seat.price && <span className={styles.seatPrice}>{seat.price}</span>}
        </div>
        <p className={styles.seatNote}>{seat.note}</p>
        {i < (plan.seats?.length ?? 0) - 1 && <div className={styles.seatDivider} />}
      </div>
    ))}

    {plan.featuresTitle && (
      <p className={styles.featuresTitle}>{plan.featuresTitle}</p>
    )}

    <ul className={styles.featureList}>
      {plan.features.map((f, i) => (
        <li key={i} className={styles.featureItem}>
          <CheckIcon />
          <span>{f.text}</span>
        </li>
      ))}
    </ul>

    <button className={styles.planBtn}>{plan.buttonLabel}</button>
  </div>
);

// ==================== Main Pricing Section ====================

const PricingSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PricingTab>('individual');

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Explore plans</h2>

      <div className={styles.tabSwitcher}>
        <button
          className={activeTab === 'individual' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('individual')}
        >
          Individual
        </button>
        <button
          className={activeTab === 'team' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('team')}
        >
          Team and Enterprise
        </button>
      </div>

      {activeTab === 'individual' ? (
        <div className={styles.individualGrid}>
          {INDIVIDUAL_PLANS.map((plan: IndividualPlan) => (
            <IndividualCard key={plan.id} plan={plan} />
          ))}
        </div>
      ) : (
        <div className={styles.teamGrid}>
          {TEAM_PLANS.map((plan: TeamPlan) => (
            <TeamCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </section>
  );
};

export default PricingSection;
