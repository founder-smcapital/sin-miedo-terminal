import React, { useState, useRef, useEffect } from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Copy,
  Check,
  ChevronDown,
  Loader2,
} from "lucide-react";
import {
  downloadCsvFile,
  copyCsvToClipboard,
  exportSvgOrElementAsPng,
} from "../utils/chartExportUtils";

export interface ChartExportData {
  filename: string;
  headers: string[];
  rows: (string | number | null | undefined)[][];
  metaComments?: string[];
}

export interface CustomPngOption {
  id: string;
  label: string;
  sublabel?: string;
  iconColor?: string;
  onExport: () => void | boolean | Promise<void | boolean | unknown>;
}

interface ChartExportDropdownProps {
  chartTitle: string;
  chartContainerId?: string;
  chartElementRef?: React.RefObject<HTMLElement | null>;
  getCsvData?: () => ChartExportData;
  onExportPdf?: () => void | Promise<void>;
  onExportPng?: () => void | Promise<void>;
  customPngOptions?: CustomPngOption[];
  subtitle?: string;
  buttonLabel?: string;
  className?: string;
  align?: "left" | "right";
  size?: "sm" | "xs";
}

export const ChartExportDropdown: React.FC<ChartExportDropdownProps> = ({
  chartTitle,
  chartContainerId,
  chartElementRef,
  getCsvData,
  onExportPdf,
  onExportPng,
  customPngOptions,
  subtitle,
  buttonLabel = "Export",
  className = "",
  align = "right",
  size = "xs",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [successAction, setSuccessAction] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const triggerSuccessFeedback = (action: string) => {
    setSuccessAction(action);
    setTimeout(() => {
      setSuccessAction(null);
      setIsOpen(false);
    }, 1200);
  };

  const handleExportCsv = () => {
    if (!getCsvData) return;
    try {
      setLoadingAction("csv");
      const { filename, headers, rows, metaComments } = getCsvData();
      downloadCsvFile(filename, headers, rows, metaComments);
      triggerSuccessFeedback("csv");
    } catch (err) {
      console.error("CSV Export failed:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCopyClipboard = async () => {
    if (!getCsvData) return;
    try {
      setLoadingAction("copy");
      const { headers, rows } = getCsvData();
      const ok = await copyCsvToClipboard(headers, rows);
      if (ok) {
        triggerSuccessFeedback("copy");
      }
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExportPdf = async () => {
    if (!onExportPdf) return;
    try {
      setLoadingAction("pdf");
      await onExportPdf();
      triggerSuccessFeedback("pdf");
    } catch (err) {
      console.error("PDF Export failed:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExportPng = async () => {
    try {
      setLoadingAction("png");
      setIsOpen(false); // Close dropdown menu immediately so it is not visible during capture
      if (onExportPng) {
        await onExportPng();
        triggerSuccessFeedback("png");
        return;
      }

      // Default PNG export via container id or element ref
      const target =
        chartElementRef?.current ||
        (chartContainerId ? document.getElementById(chartContainerId) : null);

      if (target) {
        const cleanName = chartTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const ok = await exportSvgOrElementAsPng(
          target,
          cleanName,
          chartTitle,
          subtitle
        );
        if (ok) {
          triggerSuccessFeedback("png");
        }
      } else {
        console.warn("No chart container found for PNG export");
      }
    } catch (err) {
      console.error("PNG export error:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  const isSmall = size === "xs";

  return (
    <div
      className={`relative inline-block text-left chart-export-dropdown-container ${className}`}
      ref={menuRef}
      data-export-ignore="true"
    >
      <button
        type="button"
        id={`export-btn-${chartTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
        onClick={() => setIsOpen(!isOpen)}
        title={`Export ${chartTitle} (CSV, PDF, PNG)`}
        className={`flex items-center gap-1.5 rounded-lg border font-mono-data font-bold transition-all shadow-sm ${
          isSmall ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs"
        } ${
          isOpen
            ? "bg-[#B08D57] text-[#0A111C] border-[#B08D57] shadow-[0_0_12px_rgba(176,141,87,0.4)]"
            : "bg-black/70 hover:bg-[#B08D57]/20 text-[#E5C794] border-[#B08D57]/35 hover:border-[#B08D57] hover:text-[#EDE9DE]"
        }`}
      >
        <Download className={`${isSmall ? "w-3 h-3" : "w-3.5 h-3.5"}`} />
        <span>{buttonLabel}</span>
        <ChevronDown
          className={`${isSmall ? "w-3 h-3" : "w-3.5 h-3.5"} transition-transform ${
            isOpen ? "rotate-180 text-[#0A111C]" : "opacity-75"
          }`}
        />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div
          data-export-ignore="true"
          className={`chart-export-menu absolute z-50 mt-1.5 w-56 rounded-xl bg-[#0A111C] border border-[#B08D57]/50 shadow-[0_10px_35px_rgba(0,0,0,0.85)] p-1.5 font-mono-data text-xs backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {/* Header Title inside Dropdown */}
          <div className="px-2.5 py-1.5 border-b border-[#B08D57]/20 mb-1">
            <div className="text-[9.5px] uppercase tracking-wider text-[#B08D57] font-bold">
              Export Visual &amp; Data
            </div>
            <div className="text-[10px] text-[#EDE9DE] font-serif italic truncate">
              {chartTitle}
            </div>
          </div>

          <div className="space-y-0.5">
            {/* 1. CSV Data Export */}
            {getCsvData && (
              <button
                type="button"
                onClick={handleExportCsv}
                disabled={loadingAction !== null}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-[#EDE9DE] hover:bg-[#B08D57]/20 hover:text-[#FBF8F1] transition-colors group disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#10B981] group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold text-[11px] leading-tight">Spreadsheet (CSV)</div>
                    <div className="text-[9px] text-[#8292A6]">Clean tabular timeseries dataset</div>
                  </div>
                </div>
                {loadingAction === "csv" ? (
                  <Loader2 className="w-3 h-3 animate-spin text-[#B08D57]" />
                ) : successAction === "csv" ? (
                  <Check className="w-3 h-3 text-[#10B981]" />
                ) : (
                  <span className="text-[9px] text-[#8292A6] opacity-75">.csv</span>
                )}
              </button>
            )}

            {/* 2. Executive PDF Report */}
            {onExportPdf && (
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={loadingAction !== null}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-[#EDE9DE] hover:bg-[#B08D57]/20 hover:text-[#FBF8F1] transition-colors group disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-[#E5C794] group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold text-[11px] leading-tight">Institutional PDF</div>
                    <div className="text-[9px] text-[#8292A6]">1-Page vector briefing &amp; models</div>
                  </div>
                </div>
                {loadingAction === "pdf" ? (
                  <Loader2 className="w-3 h-3 animate-spin text-[#B08D57]" />
                ) : successAction === "pdf" ? (
                  <Check className="w-3 h-3 text-[#10B981]" />
                ) : (
                  <span className="text-[9px] text-[#8292A6] opacity-75">.pdf</span>
                )}
              </button>
            )}

            {/* 3. PNG High-Res Snapshots */}
            {customPngOptions && customPngOptions.length > 0 ? (
              <div className="space-y-0.5 border-t border-[#253347]/40 pt-1 mt-0.5">
                <div className="px-2.5 py-0.5 text-[8.5px] uppercase tracking-wider text-[#B08D57] font-bold">
                  Image Snapshots ({customPngOptions.length} Views)
                </div>
                {customPngOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={async () => {
                      try {
                        setLoadingAction(opt.id);
                        setIsOpen(false);
                        await opt.onExport();
                        triggerSuccessFeedback(opt.id);
                      } catch (err) {
                        console.error("Export failed:", err);
                      } finally {
                        setLoadingAction(null);
                      }
                    }}
                    disabled={loadingAction !== null}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-[#EDE9DE] hover:bg-[#B08D57]/20 hover:text-[#FBF8F1] transition-colors group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-2">
                      <ImageIcon
                        className="w-3.5 h-3.5 group-hover:scale-110 transition-transform shrink-0"
                        style={{ color: opt.iconColor || "#60A5FA" }}
                      />
                      <div>
                        <div className="font-semibold text-[11px] leading-tight">{opt.label}</div>
                        {opt.sublabel && (
                          <div className="text-[9px] text-[#8292A6]">{opt.sublabel}</div>
                        )}
                      </div>
                    </div>
                    {loadingAction === opt.id ? (
                      <Loader2 className="w-3 h-3 animate-spin text-[#B08D57]" />
                    ) : successAction === opt.id ? (
                      <Check className="w-3 h-3 text-[#10B981]" />
                    ) : (
                      <span className="text-[9px] text-[#8292A6] opacity-75">.png</span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleExportPng}
                disabled={loadingAction !== null}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-[#EDE9DE] hover:bg-[#B08D57]/20 hover:text-[#FBF8F1] transition-colors group disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5 text-[#60A5FA] group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold text-[11px] leading-tight">Image Snapshot (PNG)</div>
                    <div className="text-[9px] text-[#8292A6]">2× High-DPI chart capture</div>
                  </div>
                </div>
                {loadingAction === "png" ? (
                  <Loader2 className="w-3 h-3 animate-spin text-[#B08D57]" />
                ) : successAction === "png" ? (
                  <Check className="w-3 h-3 text-[#10B981]" />
                ) : (
                  <span className="text-[9px] text-[#8292A6] opacity-75">.png</span>
                )}
              </button>
            )}

            {/* 4. Copy to Clipboard */}
            {getCsvData && (
              <button
                type="button"
                onClick={handleCopyClipboard}
                disabled={loadingAction !== null}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-[#EDE9DE] hover:bg-[#B08D57]/20 hover:text-[#FBF8F1] transition-colors group disabled:opacity-50 border-t border-[#253347]/40 pt-1.5 mt-1"
              >
                <div className="flex items-center gap-2">
                  <Copy className="w-3.5 h-3.5 text-[#C084FC] group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold text-[11px] leading-tight">Copy Data to Clipboard</div>
                    <div className="text-[9px] text-[#8292A6]">TSV format (Excel / Sheets ready)</div>
                  </div>
                </div>
                {loadingAction === "copy" ? (
                  <Loader2 className="w-3 h-3 animate-spin text-[#B08D57]" />
                ) : successAction === "copy" ? (
                  <Check className="w-3 h-3 text-[#10B981]" />
                ) : null}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
