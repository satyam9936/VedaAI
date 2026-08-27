export function generateQuestionPaperPage1(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1050" width="800" height="1050">
    <rect width="800" height="1050" fill="#ffffff"/>
    <rect x="0" y="0" width="800" height="120" fill="#1e293b"/>
    <text x="400" y="45" font-family="Inter, sans-serif" font-size="22" font-weight="bold" fill="#ffffff" text-anchor="middle">VEDA ACADEMY - MID-TERM EVALUATION 2026</text>
    <text x="400" y="75" font-family="Inter, sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">Subject: Physics &amp; Mathematics (Code: PHY-102) | Time: 3 Hours | Max Marks: 25</text>
    <line x1="40" y1="100" x2="760" y2="100" stroke="#475569" stroke-width="1"/>
    
    <rect x="40" y="140" width="720" height="32" rx="6" fill="#f1f5f9"/>
    <text x="55" y="161" font-family="Inter, sans-serif" font-size="14" font-weight="bold" fill="#0f172a">SECTION A: SHORT &amp; ANALYTICAL QUESTIONS</text>
    
    <text x="40" y="210" font-family="Inter, sans-serif" font-size="15" font-weight="bold" fill="#0f172a">Q1.</text>
    <text x="80" y="210" font-family="Inter, sans-serif" font-size="14" fill="#334155">Define Newton's Second Law of Motion and state its SI unit of force.</text>
    <text x="710" y="210" font-family="Inter, sans-serif" font-size="13" font-weight="bold" fill="#64748b">[2 Marks]</text>

    <text x="40" y="270" font-family="Inter, sans-serif" font-size="15" font-weight="bold" fill="#0f172a">Q2 (a)</text>
    <text x="100" y="270" font-family="Inter, sans-serif" font-size="14" fill="#334155">A block of mass m = 5 kg is pulled with a constant force F = 20 N on a smooth surface.</text>
    <text x="100" y="292" font-family="Inter, sans-serif" font-size="14" fill="#334155">Calculate the resulting acceleration of the block.</text>
    <text x="710" y="270" font-family="Inter, sans-serif" font-size="13" font-weight="bold" fill="#64748b">[3 Marks]</text>

    <text x="40" y="350" font-family="Inter, sans-serif" font-size="15" font-weight="bold" fill="#0f172a">Q2 (b)</text>
    <text x="100" y="350" font-family="Inter, sans-serif" font-size="14" fill="#334155">If a friction coefficient μ = 0.2 is introduced, determine the new acceleration.</text>
    <text x="710" y="350" font-family="Inter, sans-serif" font-size="13" font-weight="bold" fill="#64748b">[4 Marks]</text>

    <text x="40" y="430" font-family="Inter, sans-serif" font-size="15" font-weight="bold" fill="#0f172a">Q3.</text>
    <text x="80" y="430" font-family="Inter, sans-serif" font-size="14" fill="#334155">State the Law of Conservation of Linear Momentum. Derive the formula for an elastic collision</text>
    <text x="80" y="452" font-family="Inter, sans-serif" font-size="14" fill="#334155">between two masses m1 and m2 in one dimension.</text>
    <text x="710" y="430" font-family="Inter, sans-serif" font-size="13" font-weight="bold" fill="#64748b">[5 Marks]</text>

    <text x="40" y="520" font-family="Inter, sans-serif" font-size="15" font-weight="bold" fill="#0f172a">Q4.</text>
    <text x="80" y="520" font-family="Inter, sans-serif" font-size="14" fill="#334155">Explain the First Law of Thermodynamics and calculate the work done during an isothermal expansion.</text>
    <text x="710" y="520" font-family="Inter, sans-serif" font-size="13" font-weight="bold" fill="#64748b">[4 Marks]</text>

    <rect x="40" y="600" width="720" height="32" rx="6" fill="#f1f5f9"/>
    <text x="55" y="621" font-family="Inter, sans-serif" font-size="14" font-weight="bold" fill="#0f172a">SECTION B: OPTICS &amp; WAVE MECHANICS</text>

    <text x="40" y="670" font-family="Inter, sans-serif" font-size="15" font-weight="bold" fill="#0f172a">Q11 (a)</text>
    <text x="110" y="670" font-family="Inter, sans-serif" font-size="14" fill="#334155">Derive the condition for constructive and destructive interference in Young's Double Slit</text>
    <text x="110" y="692" font-family="Inter, sans-serif" font-size="14" fill="#334155">Experiment (YDSE). Show path difference Δx = nλ for maxima.</text>
    <text x="710" y="670" font-family="Inter, sans-serif" font-size="13" font-weight="bold" fill="#64748b">[4 Marks]</text>

    <text x="40" y="770" font-family="Inter, sans-serif" font-size="15" font-weight="bold" fill="#0f172a">Q11 (b)</text>
    <text x="110" y="770" font-family="Inter, sans-serif" font-size="14" fill="#334155">In a YDSE setup, light of wavelength λ = 600 nm is used with slit separation d = 0.5 mm</text>
    <text x="110" y="792" font-family="Inter, sans-serif" font-size="14" fill="#334155">and screen distance D = 1.5 m. Calculate the fringe width β.</text>
    <text x="710" y="770" font-family="Inter, sans-serif" font-size="13" font-weight="bold" fill="#64748b">[3 Marks]</text>

    <line x1="40" y1="980" x2="760" y2="980" stroke="#cbd5e1" stroke-width="1"/>
    <text x="400" y="1010" font-family="Inter, sans-serif" font-size="12" fill="#94a3b8" text-anchor="middle">Page 1 of 1 --- End of Question Paper ---</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateAnswerSheetPage1(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1050" width="800" height="1050">
    <rect width="800" height="1050" fill="#fcfdfa"/>
    <g stroke="#e2e8f0" stroke-width="1">
      ${Array.from({ length: 30 }).map((_, i) => `<line x1="0" y1="${100 + i * 30}" x2="800" y2="${100 + i * 30}" />`).join('')}
    </g>

    <line x1="120" y1="0" x2="120" y2="1050" stroke="#f87171" stroke-width="2" stroke-dasharray="4 2"/>
    
    <text x="140" y="45" font-family="Kalam, cursive" font-size="18" font-weight="bold" fill="#1e3a8a">Student: Rahul Sharma | Roll No: 1042 | Page 1</text>
    <line x1="120" y1="60" x2="780" y2="60" stroke="#94a3b8" stroke-width="1"/>

    <text x="50" y="125" font-family="Kalam, cursive" font-size="20" font-weight="bold" fill="#1d4ed8">Ans 1.</text>
    <text x="140" y="125" font-family="Kalam, cursive" font-size="18" fill="#1e293b">Newton's Second Law states that force is rate of change of momentum.</text>
    <text x="140" y="155" font-family="Kalam, cursive" font-size="18" fill="#1e293b">Formula: F = m × a.</text>
    <text x="140" y="185" font-family="Kalam, cursive" font-size="18" fill="#1e293b">SI Unit of Force is Newton (N) or kg·m/s².</text>

    <text x="40" y="245" font-family="Kalam, cursive" font-size="20" font-weight="bold" fill="#1d4ed8">Ans 2(a)</text>
    <text x="140" y="245" font-family="Kalam, cursive" font-size="18" fill="#1e293b">Given: Mass (m) = 5 kg, Force (F) = 20 N</text>
    <text x="140" y="275" font-family="Kalam, cursive" font-size="18" fill="#1e293b">Using Newton's 2nd Law: F = m × a  =&gt;  a = F / m</text>
    <text x="140" y="305" font-family="Kalam, cursive" font-size="18" fill="#1e293b">a = 20 / 5 = 4 m/s²</text>
    <text x="140" y="335" font-family="Kalam, cursive" font-size="18" font-weight="bold" fill="#047857">[Answer: acceleration = 4 m/s²]</text>

    <text x="40" y="395" font-family="Kalam, cursive" font-size="20" font-weight="bold" fill="#1d4ed8">Ans 2(b)</text>
    <text x="140" y="395" font-family="Kalam, cursive" font-size="18" fill="#1e293b">Friction force f_k = μ × m × g = 0.2 × 5 × 9.8 = 9.8 N</text>
    <text x="140" y="425" font-family="Kalam, cursive" font-size="18" fill="#1e293b">Net force F_net = F - f_k = 20 - 9.8 = 10.2 N</text>
    <text x="140" y="455" font-family="Kalam, cursive" font-size="18" fill="#1e293b">New acceleration a' = 10.2 / 5 = 2.04 m/s²</text>

    <text x="40" y="545" font-family="Kalam, cursive" font-size="20" font-weight="bold" fill="#1d4ed8">Ans 11(a)</text>
    <text x="140" y="545" font-family="Kalam, cursive" font-size="18" fill="#1e293b">Young's Double Slit Interference Derivation:</text>
    <text x="140" y="575" font-family="Kalam, cursive" font-size="18" fill="#1e293b">Consider two coherent sources S1 and S2 separated by d.</text>
    <text x="140" y="605" font-family="Kalam, cursive" font-size="18" fill="#1e293b">Path difference between waves at point P on screen at distance D:</text>
    <text x="140" y="635" font-family="Kalam, cursive" font-size="18" stroke="#1d4ed8" fill="#1d4ed8">Δx = (x × d) / D</text>
    
    <rect x="150" y="665" width="400" height="150" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
    <line x1="200" y1="685" x2="200" y2="795" stroke="#334155" stroke-width="3"/>
    <circle cx="200" cy="710" r="4" fill="#ef4444"/> <text x="175" y="715" font-family="sans-serif" font-size="12">S1</text>
    <circle cx="200" cy="770" r="4" fill="#ef4444"/> <text x="175" y="775" font-family="sans-serif" font-size="12">S2</text>
    <line x1="500" y1="685" x2="500" y2="795" stroke="#334155" stroke-width="3"/> <text x="510" y="740" font-family="sans-serif" font-size="12">Screen</text>
    <line x1="200" y1="710" x2="500" y2="710" stroke="#94a3b8" stroke-dasharray="3 3"/>
    <line x1="200" y1="710" x2="500" y2="695" stroke="#3b82f6" stroke-width="1.5"/>
    <line x1="200" y1="770" x2="500" y2="695" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="320" y="800" font-family="Kalam, cursive" font-size="16" fill="#1e293b">(Continued on Page 2...)</text>

    <text x="700" y="1010" font-family="Inter, sans-serif" font-size="12" fill="#94a3b8">Page 1/2</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateAnswerSheetPage2(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1050" width="800" height="1050">
    <rect width="800" height="1050" fill="#fcfdfa"/>
    <g stroke="#e2e8f0" stroke-width="1">
      ${Array.from({ length: 30 }).map((_, i) => `<line x1="0" y1="${100 + i * 30}" x2="800" y2="${100 + i * 30}" />`).join('')}
    </g>

    <line x1="120" y1="0" x2="120" y2="1050" stroke="#f87171" stroke-width="2" stroke-dasharray="4 2"/>
    
    <text x="140" y="45" font-family="Kalam, cursive" font-size="18" font-weight="bold" fill="#1e3a8a">Student: Rahul Sharma | Roll No: 1042 | Page 2</text>
    <line x1="120" y1="60" x2="780" y2="60" stroke="#94a3b8" stroke-width="1"/>

    <text x="40" y="115" font-family="Kalam, cursive" font-size="20" font-weight="bold" fill="#1d4ed8">11(a) cont.</text>
    <text x="140" y="115" font-family="Kalam, cursive" font-size="18" fill="#1e293b">1) Constructive Interference (Bright Fringes):</text>
    <text x="140" y="145" font-family="Kalam, cursive" font-size="18" fill="#1e293b">Path diff Δx = n × λ  (where n = 0, 1, 2, ...)</text>
    <text x="140" y="175" font-family="Kalam, cursive" font-size="18" fill="#1e293b">2) Destructive Interference (Dark Fringes):</text>
    <text x="140" y="205" font-family="Kalam, cursive" font-size="18" fill="#1e293b">Path diff Δx = (2n - 1) × λ / 2</text>

    <text x="40" y="275" font-family="Kalam, cursive" font-size="20" font-weight="bold" fill="#1d4ed8">Ans 11(b)</text>
    <text x="140" y="275" font-family="Kalam, cursive" font-size="18" fill="#1e293b">λ = 600 nm = 6 × 10^-7 m, d = 0.5 mm = 5 × 10^-4 m, D = 1.5 m</text>
    <text x="140" y="305" font-family="Kalam, cursive" font-size="18" fill="#1e293b">Fringe width β = (λ × D) / d</text>
    <text x="140" y="335" font-family="Kalam, cursive" font-size="18" fill="#1e293b">β = (6×10^-7 × 1.5) / (5×10^-4) = 1.8 × 10^-3 m = 1.8 mm</text>

    <rect x="135" y="380" width="630" height="230" rx="8" fill="#fffbeb" stroke="#fde68a" stroke-width="1"/>
    <text x="40" y="415" font-family="Kalam, cursive" font-size="20" font-weight="bold" fill="#b45309">Ans 3.</text>
    <text x="140" y="415" font-family="Kalam, cursive" font-size="18" font-weight="bold" fill="#92400e">[ANSWERED OUT OF ORDER]</text>
    <text x="140" y="445" font-family="Kalam, cursive" font-size="18" fill="#1e293b">Law of Conservation of Linear Momentum:</text>
    <text x="140" y="475" font-family="Kalam, cursive" font-size="18" fill="#1e293b">Total momentum before collision equals total momentum after collision.</text>
    <text x="140" y="505" font-family="Kalam, cursive" font-size="18" fill="#1e293b">m1 u1 + m2 u2 = m1 v1 + m2 v2</text>
    <text x="140" y="535" font-family="Kalam, cursive" font-size="18" fill="#1e293b">For 1D elastic collision: v1 = ((m1-m2)u1 + 2m2 u2)/(m1+m2)</text>

    <g opacity="0.85">
      <rect x="135" y="650" width="630" height="150" rx="8" fill="#fff1f2" stroke="#fecdd3" stroke-dasharray="4 2"/>
      <text x="40" y="685" font-family="Kalam, cursive" font-size="18" font-weight="bold" fill="#e11d48">Extra</text>
      <text x="140" y="685" font-family="Kalam, cursive" font-size="17" font-weight="bold" fill="#be123c">[UNMATCHED STUDENT WRITING / ROUGH WORK]</text>
      <text x="140" y="715" font-family="Kalam, cursive" font-size="16" fill="#475569">Calculated kinetic energy K.E = 1/2 m v² = 0.5 × 5 × (4)² = 40 Joules.</text>
      <text x="140" y="745" font-family="Kalam, cursive" font-size="16" fill="#475569">Note: Kinetic energy formula check for extra credit.</text>
    </g>

    <text x="700" y="1010" font-family="Inter, sans-serif" font-size="12" fill="#94a3b8">Page 2/2</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
