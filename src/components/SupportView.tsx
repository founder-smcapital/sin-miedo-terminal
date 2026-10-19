import React, { useState } from "react";
import { apiFetch } from "../api";
import {
  Mail,
  Send,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  User,
  Tag,
  AlertCircle,
  Clock,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  CornerDownRight,
  ArrowRight
} from "lucide-react";

interface SupportViewProps {
  userEmail?: string;
  userName?: string;
}

export const SupportView: React.FC<SupportViewProps> = ({
  userEmail = "",
  userName = ""
}) => {
  const [name, setName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [category, setCategory] = useState("Macro Data & Indicator Question");
  const [priority, setPriority] = useState<"Normal" | "High" | "Urgent">("Normal");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  const categories = [
    "Macro Data & Indicator Question",
    "BoJ / Yen Intervention Telemetry",
    "Middle East / Hormuz Risk Feed",
    "Iran Shadow Fleet Satellite Tracking",
    "IBEX 35 / European Banking Desk",
    "Account Access & Subscription",
    "Terminal Feedback or Bug Report",
    "General Question"
  ];

  const targetRecipient = "founder@sinmiedocapital.com";

  const generateEmailBody = () => {
    return `Hello Sin Miedo Capital Support Desk,

I am submitting the following inquiry:

--- INQUIRY DETAILS ---
Name: ${name.trim() || "Unspecified"}
Email for Reply: ${email.trim()}
Category: ${category}
Priority: ${priority}
Submitted At: ${new Date().toUTCString()}

--- MESSAGE ---
${message.trim()}

---
Sent via Sin Miedo Capital Intelligence Terminal`;
  };

  const generateMailtoUrl = () => {
    const fullSubject = `[SMC Support - ${category}] ${subject.trim() || "Inquiry from Portal"}`;
    const body = generateEmailBody();
    return `mailto:${targetRecipient}?subject=${encodeURIComponent(fullSubject)}&body=${encodeURIComponent(body)}`;
  };

  const generateGmailWebmailUrl = () => {
    const fullSubject = `[SMC Support - ${category}] ${subject.trim() || "Inquiry from Portal"}`;
    const body = generateEmailBody();
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(targetRecipient)}&su=${encodeURIComponent(fullSubject)}&body=${encodeURIComponent(body)}`;
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(targetRecipient);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generateEmailBody());
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !message.trim()) {
      setErrorMessage("Please provide both your email address and your message.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Submit to backend API to log ticket
      const response = await apiFetch("/api/support/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          category,
          priority,
          subject: subject.trim() || `Inquiry regarding ${category}`,
          message
        })
      });

      const data = await response.json();
      const generatedTicket = data.ticketId || `SMC-SUP-${Date.now().toString().slice(-6)}`;
      setTicketId(generatedTicket);

      // 2. Trigger automatic mailto launch to email founder@sinmiedocapital.com
      const mailtoUrl = generateMailtoUrl();
      const link = document.createElement("a");
      link.href = mailtoUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsSubmitted(true);
    } catch (err: any) {
      console.warn("Server logging error, using direct mailto fallback:", err);
      // Even if server request fails, dispatch mailto
      setTicketId(`SMC-SUP-${Date.now().toString().slice(-6)}`);
      const mailtoUrl = generateMailtoUrl();
      window.location.href = mailtoUrl;
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setSubject("");
    setMessage("");
    setTicketId("");
  };

  return (
    <div id="support-view-container" className="space-y-6 animate-in fade-in max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-[#222C3D] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#EDE9DE]">
              Desk Support & Contact
            </h1>
            <span className="text-[9px] font-mono-data font-bold uppercase tracking-wider bg-[#B08D57]/20 text-[#E5C794] border border-[#B08D57]/40 px-2 py-0.5 rounded">
              Direct Human Response
            </span>
          </div>
          <p className="text-xs font-mono-data text-[#8292A6] mt-1">
            DIRECT INQUIRY GATEWAY // PERSONALLY ANSWERED AT{" "}
            <span className="text-[#B08D57] font-semibold">{targetRecipient}</span>
          </p>
        </div>

        {/* Quick Email Copy Chip */}
        <button
          id="copy-support-email-btn"
          onClick={handleCopyEmail}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141923] border border-[#B08D57]/30 hover:border-[#B08D57] text-[#EDE9DE] hover:text-[#B08D57] text-xs font-mono-data transition-all shadow-sm group"
          title="Click to copy email address"
        >
          <Mail className="w-3.5 h-3.5 text-[#B08D57]" />
          <span>{targetRecipient}</span>
          {copiedEmail ? (
            <span className="flex items-center gap-1 text-[#10B981] font-semibold text-[11px]">
              <Check className="w-3 h-3" /> Copied!
            </span>
          ) : (
            <Copy className="w-3 h-3 text-[#8292A6] group-hover:text-[#EDE9DE]" />
          )}
        </button>
      </div>

      {/* Manual Support Policy Notice Box */}
      <div className="bg-[#141923] border-l-4 border-l-[#B08D57] border border-[#222C3D] rounded-xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-[#B08D57]/15 text-[#B08D57] shrink-0 mt-0.5">
            <User className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-[#EDE9DE] flex items-center gap-2">
              <span>Personal Support Notice</span>
              <span className="text-[10px] font-mono-data uppercase text-[#B08D57] bg-[#B08D57]/10 px-1.5 py-0.5 rounded">
                No Automated Chatbots
              </span>
            </h2>
            <p className="text-xs text-[#BAC7D5] leading-relaxed">
              We do not use an automated support team or AI auto-responders for customer service. 
              Questions are reviewed and manually answered by our desk manager. When you submit the form below, 
              it will automatically draft and route your message directly to{" "}
              <strong className="text-[#EDE9DE] underline decoration-[#B08D57]/50">{targetRecipient}</strong>, 
              and you will receive a personal reply directly to your email address.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Sidebar Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: The Support Form or Success State */}
        <div className="lg:col-span-2">
          {isSubmitted ? (
            /* Success State */
            <div
              id="support-success-card"
              className="bg-[#141923] border border-[#10B981]/40 rounded-xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-[#222C3D]">
                <div className="p-3 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-editorial text-xl font-bold text-[#EDE9DE]">
                    Inquiry Routed Successfully
                  </h3>
                  <p className="text-xs font-mono-data text-[#8292A6]">
                    REFERENCE TICKET ID: <span className="text-[#E5C794] font-bold">{ticketId}</span>
                  </p>
                </div>
              </div>

              <div className="bg-[#0D121D] border border-[#222C3D] rounded-lg p-4 space-y-3 text-xs">
                <div className="flex items-start gap-2 text-[#BAC7D5]">
                  <CornerDownRight className="w-4 h-4 text-[#B08D57] shrink-0 mt-0.5" />
                  <div>
                    Your inquiry has been dispatched to{" "}
                    <strong className="text-[#EDE9DE] font-mono-data">{targetRecipient}</strong>.
                  </div>
                </div>
                <div className="flex items-start gap-2 text-[#BAC7D5]">
                  <CornerDownRight className="w-4 h-4 text-[#B08D57] shrink-0 mt-0.5" />
                  <div>
                    A personal reply will be sent directly to your email address:{" "}
                    <strong className="text-[#EDE9DE] font-mono-data">{email}</strong>.
                  </div>
                </div>
                <div className="flex items-start gap-2 text-[#8292A6] text-[11px] pt-2 border-t border-[#222C3D]">
                  <Clock className="w-3.5 h-3.5 text-[#B08D57] shrink-0 mt-0.5" />
                  <span>
                    Your mail client was triggered automatically. If your email composer did not open or you use webmail, please click one of the options below.
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  id="open-gmail-webmail-btn"
                  href={generateGmailWebmailUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#B08D57] text-[#0A111C] font-semibold text-xs transition-all hover:bg-[#C4A06A] shadow-md"
                >
                  <Mail className="w-4 h-4" />
                  <span>Open in Gmail Webmail</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>

                <a
                  id="open-default-mail-btn"
                  href={generateMailtoUrl()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-black/50 border border-[#B08D57]/40 text-[#EDE9DE] hover:text-[#B08D57] font-semibold text-xs transition-all hover:border-[#B08D57]"
                >
                  <Send className="w-4 h-4 text-[#B08D57]" />
                  <span>Open Default Email Client</span>
                </a>

                <button
                  id="copy-inquiry-body-btn"
                  onClick={handleCopyMessage}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#141923] border border-[#222C3D] hover:border-[#B08D57]/40 text-[#BAC7D5] hover:text-[#EDE9DE] text-xs transition-all"
                >
                  {copiedBody ? (
                    <>
                      <Check className="w-4 h-4 text-[#10B981]" />
                      <span className="text-[#10B981]">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Full Message</span>
                    </>
                  )}
                </button>
              </div>

              <div className="pt-4 border-t border-[#222C3D]">
                <button
                  onClick={handleReset}
                  className="text-xs font-mono-data text-[#8292A6] hover:text-[#B08D57] underline decoration-dashed"
                >
                  ← Submit another support question
                </button>
              </div>
            </div>
          ) : (
            /* Generic Support Form */
            <form
              id="generic-support-form"
              onSubmit={handleSubmit}
              className="bg-[#141923] border border-[#222C3D] rounded-xl p-5 sm:p-7 shadow-xl space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#222C3D]">
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-5 h-5 text-[#B08D57]" />
                  <h3 className="font-editorial text-lg font-bold text-[#EDE9DE]">
                    Submit an Inquiry
                  </h3>
                </div>
                <span className="text-[10px] font-mono-data text-[#8292A6]">
                  All fields routed to {targetRecipient}
                </span>
              </div>

              {errorMessage && (
                <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-lg text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Name & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="support-name" className="block text-xs font-mono-data uppercase text-[#BAC7D5] mb-1.5 font-medium">
                    Your Name / Organization
                  </label>
                  <input
                    id="support-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan (Portfolio Manager)"
                    className="w-full bg-[#0B1019] border border-[#2B3545] focus:border-[#B08D57] focus:ring-1 focus:ring-[#B08D57] rounded-lg px-3.5 py-2.5 text-xs text-[#EDE9DE] placeholder-[#5A687D] outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="support-email" className="block text-xs font-mono-data uppercase text-[#BAC7D5] mb-1.5 font-medium">
                    Your Email Address <span className="text-[#B08D57]">*</span>
                  </label>
                  <input
                    id="support-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@firm.com"
                    className="w-full bg-[#0B1019] border border-[#2B3545] focus:border-[#B08D57] focus:ring-1 focus:ring-[#B08D57] rounded-lg px-3.5 py-2.5 text-xs text-[#EDE9DE] placeholder-[#5A687D] outline-none transition-all"
                  />
                  <span className="text-[10px] font-mono-data text-[#8292A6] mt-1 block">
                    We will reply directly to this address.
                  </span>
                </div>
              </div>

              {/* Category & Priority Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="support-category" className="block text-xs font-mono-data uppercase text-[#BAC7D5] mb-1.5 font-medium">
                    Inquiry Category
                  </label>
                  <select
                    id="support-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0B1019] border border-[#2B3545] focus:border-[#B08D57] focus:ring-1 focus:ring-[#B08D57] rounded-lg px-3.5 py-2.5 text-xs text-[#EDE9DE] outline-none transition-all cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#0B1019] text-[#EDE9DE]">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono-data uppercase text-[#BAC7D5] mb-1.5 font-medium">
                    Urgency / Priority
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Normal", "High", "Urgent"] as const).map((p) => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setPriority(p)}
                        className={`py-2 px-2 text-center rounded-lg border text-xs font-mono-data transition-all ${
                          priority === p
                            ? p === "Urgent"
                              ? "bg-red-950/60 border-red-500 text-red-200 font-bold"
                              : p === "High"
                              ? "bg-[#B08D57]/30 border-[#B08D57] text-[#F3E5AB] font-bold"
                              : "bg-[#1A2333] border-[#B08D57]/60 text-[#EDE9DE] font-bold"
                            : "bg-[#0B1019] border-[#222C3D] text-[#8292A6] hover:text-[#EDE9DE]"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subject Line */}
              <div>
                <label htmlFor="support-subject" className="block text-xs font-mono-data uppercase text-[#BAC7D5] mb-1.5 font-medium">
                  Subject Line
                </label>
                <input
                  id="support-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Discrepancy question on USD/JPY intervention alert threshold"
                  className="w-full bg-[#0B1019] border border-[#2B3545] focus:border-[#B08D57] focus:ring-1 focus:ring-[#B08D57] rounded-lg px-3.5 py-2.5 text-xs text-[#EDE9DE] placeholder-[#5A687D] outline-none transition-all"
                />
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="support-message" className="text-xs font-mono-data uppercase text-[#BAC7D5] font-medium">
                    Message Details <span className="text-[#B08D57]">*</span>
                  </label>
                  <span className="text-[10px] font-mono-data text-[#8292A6]">
                    {message.length} characters
                  </span>
                </div>
                <textarea
                  id="support-message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe your question or issue in detail. Include any relevant asset symbols, timestamps, or observations so we can provide an accurate answer..."
                  className="w-full bg-[#0B1019] border border-[#2B3545] focus:border-[#B08D57] focus:ring-1 focus:ring-[#B08D57] rounded-lg p-3.5 text-xs text-[#EDE9DE] placeholder-[#5A687D] outline-none transition-all resize-y leading-relaxed"
                />
              </div>

              {/* Submit Button & Info */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-[11px] font-mono-data text-[#8292A6] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#B08D57]" />
                  <span>Submits to <span className="text-[#E5C794] font-semibold">{targetRecipient}</span></span>
                </div>

                <button
                  id="submit-support-form-btn"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#B08D57] hover:bg-[#C4A06A] text-[#0A111C] font-semibold text-xs tracking-wide transition-all shadow-lg hover:shadow-[#B08D57]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0A111C] border-t-transparent rounded-full animate-spin" />
                      <span>Dispatching Inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send to founder@sinmiedocapital.com</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right 1 Col: Direct Contact Information Card */}
        <div className="space-y-4">
          <div className="bg-[#141923] border border-[#222C3D] rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-[#222C3D]">
              <Mail className="w-5 h-5 text-[#B08D57]" />
              <h3 className="font-editorial text-base font-bold text-[#EDE9DE]">
                Direct Contact Card
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="block text-[10px] font-mono-data uppercase text-[#8292A6]">
                  Primary Desk Inbox:
                </span>
                <div className="flex items-center justify-between gap-2 mt-1 bg-[#0B1019] p-2.5 rounded-lg border border-[#222C3D]">
                  <span className="text-[#B08D57] font-semibold font-mono-data text-xs break-all">
                    {targetRecipient}
                  </span>
                  <button
                    onClick={handleCopyEmail}
                    className="text-[#8292A6] hover:text-[#EDE9DE] p-1"
                    title="Copy email"
                  >
                    {copiedEmail ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-mono-data uppercase text-[#8292A6]">
                  Handling Model:
                </span>
                <p className="text-[#EDE9DE] text-xs mt-0.5">
                  100% human reviewed and answered manually. No automated response tickets.
                </p>
              </div>

              <div>
                <span className="block text-[10px] font-mono-data uppercase text-[#8292A6]">
                  Typical Turnaround:
                </span>
                <p className="text-[#10B981] font-medium text-xs mt-0.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Same-day response during market trading sessions
                </p>
              </div>

              <div>
                <span className="block text-[10px] font-mono-data uppercase text-[#8292A6]">
                  Scope of Support:
                </span>
                <ul className="text-[#BAC7D5] text-[11px] space-y-1 mt-1 list-disc list-inside">
                  <li>Macro indicators & econometric math</li>
                  <li>Live sentiment feed clarifications</li>
                  <li>Custom data feed requests</li>
                  <li>Bug reports & terminal enhancements</li>
                </ul>
              </div>
            </div>

            {/* Quick Mail Launcher Link */}
            <div className="pt-3 border-t border-[#222C3D]">
              <a
                href={`mailto:${targetRecipient}?subject=${encodeURIComponent("[SMC Support] Direct Inquiry")}`}
                className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-black/40 hover:bg-[#B08D57]/20 border border-[#B08D57]/30 hover:border-[#B08D57] text-[#EDE9DE] hover:text-[#B08D57] text-xs font-mono-data transition-all text-center"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#B08D57]" />
                <span>Launch Mail App Directly</span>
              </a>
            </div>
          </div>

          {/* Quick FAQ / Desk Note */}
          <div className="bg-[#141923] border border-[#222C3D] rounded-xl p-5 shadow-xl space-y-3 text-xs">
            <h4 className="font-editorial font-bold text-[#EDE9DE] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#B08D57]" />
              <span>Direct Desk Communication</span>
            </h4>
            <p className="text-[#8292A6] text-[11px] leading-relaxed">
              If you have urgent inquiries during critical market moves (e.g. Bank of Japan rate checks or Gulf chokepoint escalations), please mark your priority as <strong>Urgent</strong> in the form or email directly with &ldquo;URGENT&rdquo; in the subject line.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
