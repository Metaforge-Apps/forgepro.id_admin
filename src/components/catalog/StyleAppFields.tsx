import React from 'react';
import { Card } from '../common/Card';
import { ChevronDown } from 'lucide-react';
import type { SuitAspectRatio } from '../../controllers/style-controller';

interface StyleAppFieldsProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  aspectRatio: SuitAspectRatio;
  onAspectRatioChange: (value: SuitAspectRatio) => void;
  tagsText: string;
  onTagsChange: (value: string) => void;
  isPopular: boolean;
  onPopularChange: (value: boolean) => void;
  isNew: boolean;
  onNewChange: (value: boolean) => void;
}

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl bg-surface-card border border-border-subtle text-content-primary placeholder-content-muted focus:outline-none focus:border-[#D9B06F] transition-colors';

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 accent-[#D9B06F] cursor-pointer"
      />
      <span className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold text-content-primary">{label}</span>
        <span className="text-[11px] text-content-muted leading-relaxed">{hint}</span>
      </span>
    </label>
  );
}

/**
 * Field gaya yang dibaca langsung oleh aplikasi Flutter:
 * prompt AI, aspek rasio target (9:16 / 16:9), tag pencarian, serta label Populer / Baru.
 */
export function StyleAppFields({
  prompt,
  onPromptChange,
  aspectRatio,
  onAspectRatioChange,
  tagsText,
  onTagsChange,
  isPopular,
  onPopularChange,
  isNew,
  onNewChange,
}: StyleAppFieldsProps) {
  return (
    <Card padding="p-6 sm:p-7" className="flex flex-col gap-4">
      <h3 className="text-base font-semibold text-content-primary">
        Prompt AI &amp; parameter hasil di aplikasi
      </h3>

      <div className="flex flex-col gap-1.5 text-xs">
        <label className="font-semibold text-content-primary">Prompt AI</label>
        <textarea
          rows={6}
          placeholder="Contoh: Professional studio executive headshot of a confident 30-year-old businessman in a navy single-breasted suit..."
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          className={`${inputClass} resize-y leading-relaxed`}
        />
        <span className="text-[11px] text-content-muted mt-0.5">
          Prompt standar yang dikirim aplikasi ke model AI (FLUX / Fal.ai) untuk gaya ini.
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Aspek Rasio Target */}
        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-content-primary">
            Target Aspek Rasio AI *
          </label>
          <div className="relative">
            <select
              value={aspectRatio}
              onChange={(e) => onAspectRatioChange(e.target.value as SuitAspectRatio)}
              className={`${inputClass} appearance-none cursor-pointer pr-9 font-medium`}
            >
              <option value="9:16">9:16 — Potret Vertikal Penuh (Mobile / Pasfoto)</option>
              <option value="3:4">3:4 — Potret Studio Standar (CV / Dokumen)</option>
              <option value="16:9">16:9 — Lanskap Horisontal (Widescreen / Web)</option>
              <option value="1:1">1:1 — Persegi (Avatar / Profil LinkedIn)</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
          </div>
          <span className="text-[11px] text-content-muted">
            Menentukan proporsi kanvas gambar hasil generate AI di backend.
          </span>
        </div>

        {/* Tag Pencarian */}
        <div className="flex flex-col gap-1.5">
          <label className="font-semibold text-content-primary">Tag Pencarian</label>
          <input
            type="text"
            placeholder="LinkedIn, CV, Korporat, Pria"
            value={tagsText}
            onChange={(e) => onTagsChange(e.target.value)}
            className={inputClass}
          />
          <span className="text-[11px] text-content-muted">
            Pisahkan dengan koma. Membantu filter katalog di aplikasi.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border-subtle/60">
        <Toggle
          label="Tandai Populer"
          hint="Gaya diberi label populer di katalog aplikasi."
          checked={isPopular}
          onChange={onPopularChange}
        />
        <Toggle
          label="Tandai Baru"
          hint="Gaya diberi label baru di katalog aplikasi."
          checked={isNew}
          onChange={onNewChange}
        />
      </div>
    </Card>
  );
}

export const parseTags = (text: string): string[] =>
  text
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

export default StyleAppFields;
