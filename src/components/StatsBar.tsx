"use client";

import { useEffect, useState } from "react";

const stats = [
  { label: "Games Played", value: 0, icon: "🎮" },
  { label: "cUSD Won", value: 0, prefix: "$", icon: "💰" },
  { label: "Active Players", value: 0, icon: "👥" },
  { label: "Prize Pool", value: 0, prefix: "$", icon: "🏆" },
];

export function StatsBar() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 300); }, []);

  return (
    <section style={{ background: 'var(--color-fog-gray)', borderTop: '1px solid var(--color-steel-gray)', borderBottom: '1px solid var(--color-steel-gray)', padding: '28px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 24 }}>
          {stats.map((stat, i) => (
            <div key={stat.label} className="text-center" style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(8px)', transition: `all 0.4s ease ${i * 80}ms` }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
              <div style={{
                fontFamily: 'var(--font-suisseintl)',
                fontSize: 'var(--text-heading-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                lineHeight: 'var(--leading-heading-sm)',
                letterSpacing: 'var(--tracking-heading-sm)',
                color: 'var(--color-ink-blue)',
              }}>
                {stat.prefix || ""}{stat.value.toLocaleString()}
              </div>
              <div style={{
                fontFamily: 'var(--font-suisseintl)',
                fontSize: 'var(--text-caption)',
                color: 'var(--color-slate-text)',
                marginTop: 4,
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
