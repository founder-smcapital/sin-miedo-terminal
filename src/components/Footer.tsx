import React from "react";
import { ShieldCheck, Globe, BookOpen, MessageSquare, ExternalLink, Instagram, Linkedin } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer id="smc-footer" className="mt-16 border-t border-[#B08D57]/20 bg-[#0E1A2B] text-[#8292A6]">
      {/* Top Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Thesis */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-serif italic text-lg font-bold tracking-widest text-[#B08D57]" style={{ fontFamily: "Georgia, serif" }}>
                SIN MIEDO CAPITAL
              </span>
              <span className="text-[9px] font-mono-data bg-[#B08D57]/20 text-[#B08D57] px-1.5 py-0.5 rounded border border-[#B08D57]/40">
                SMC DESK
              </span>
            </div>
            <p className="text-xs text-[#8292A6] leading-relaxed max-w-lg font-sans">
              Sin Miedo Capital is a boutique quantitative macro research and proprietary execution collective. We synthesize central bank liquidity interventions, geopolitical maritime chokepoints, satellite SAR dark fleet tracking, and European equity dynamics into actionable alpha.
            </p>
            <div className="text-[11px] font-mono-data text-[#EDE9DE] pt-1">
              Contact Desk: <span className="text-[#B08D57]">founder@sinmiedocapital.com</span>
            </div>
          </div>

          {/* Col 2: Research & Publications */}
          <div className="space-y-2 text-xs font-mono-data">
            <span className="text-[#EDE9DE] font-bold uppercase tracking-wider block mb-2 text-[11px]">
              PUBLICATIONS & INTEL
            </span>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="https://sinmiedocapital.substack.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#B08D57] transition-colors flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#B08D57]" />
                  <span>Substack Institutional Memo</span>
                  <ExternalLink className="w-2.5 h-2.5 text-[#8292A6]" />
                </a>
              </li>
              <li>
                <a
                  href="https://medium.com/@tradeinmotions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#B08D57] transition-colors flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-[#B08D57]" />
                  <span>Medium Macro Deep Dives</span>
                  <ExternalLink className="w-2.5 h-2.5 text-[#8292A6]" />
                </a>
              </li>
              <li>
                <span className="text-[#8292A6] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B08D57]" />
                  <span>SMC Alpha Intelligence Dossiers</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Col 3: Community & Social Channels */}
          <div className="space-y-2 text-xs font-mono-data">
            <span className="text-[#EDE9DE] font-bold uppercase tracking-wider block mb-2 text-[11px]">
              COMMUNITY & SOCIALS
            </span>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="https://www.instagram.com/sinmiedocapital"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#B08D57] transition-colors flex items-center gap-1.5"
                >
                  <Instagram className="w-3.5 h-3.5 text-[#B08D57]" />
                  <span>Instagram @sinmiedocapital</span>
                  <ExternalLink className="w-2.5 h-2.5 text-[#8292A6]" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/company/tradeinmotions/?viewAsMember=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#B08D57] transition-colors flex items-center gap-1.5"
                >
                  <Linkedin className="w-3.5 h-3.5 text-[#B08D57]" />
                  <span>LinkedIn Trade in Motions</span>
                  <ExternalLink className="w-2.5 h-2.5 text-[#8292A6]" />
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#B08D57] transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#B08D57]" />
                  <span>Institutional Discord Portal</span>
                  <ExternalLink className="w-2.5 h-2.5 text-[#8292A6]" />
                </a>
              </li>
              <li>
                <span className="text-[#8292A6] flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#B08D57]" />
                  <span>Bloomberg: SMC_MACRO &lt;GO&gt;</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimers */}
        <div className="mt-8 pt-6 border-t border-[#B08D57]/15 text-[11px] text-[#8292A6] leading-relaxed space-y-2">
          <p>
            <strong className="text-[#EDE9DE]">REGULATORY & INSTITUTIONAL DISCLAIMER:</strong> All macroeconomic analyses, quantitative probability scores, satellite telemetry representations, and trading setups displayed on the Sin Miedo Capital (SMC) portal are for informational and professional educational purposes only. This portal does not constitute financial, investment, legal, or tax advice, nor does it represent an offer or solicitation to buy or sell any sovereign securities, futures contracts, options, or foreign exchange currencies.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[10px] font-mono-data">
            <span>© {new Date().getFullYear()} Sin Miedo Capital (SMC). All rights reserved.</span>
            <span>256-Bit Encrypted Institutional Gateway // Version 4.8.2</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
