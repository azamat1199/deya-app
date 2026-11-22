"use client";

import {
  useCallback,
  useEffect,
  useEffectEvent,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CountryCode } from "libphonenumber-js";

import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/useTranslation";
import {
  DEFAULT_CALLING_CODE,
  DEFAULT_COUNTRY,
  DEFAULT_PLACEHOLDER,
  defaultCountryOption,
  flagEmoji,
  loadPhone,
  matchesQuery,
  type CountryOption,
} from "@/lib/phoneLite";

type PhoneLib = Awaited<ReturnType<typeof loadPhone>>;

export interface PhoneInputProps {
  /** Localises the country names and their sort order. */
  locale: string;
  /** Spaced national digits the user sees. Owned by the parent. */
  value: string;
  /**
   * Fires on every change with both representations: `display` for the input,
   * `e164` for the API, and `isValid` for the parent's submit gate.
   */
  onChange: (next: { display: string; e164: string; isValid: boolean }) => void;
  /** Rendered below the field in the project's existing error style. */
  error?: string;
  /** Marks the field touched so the parent can defer showing errors. */
  onBlur?: () => void;
  /** Matches the surrounding fields' wrappers. */
  className?: string;
  /** Reuses the exact classes the previous fixed-prefix row carried. */
  rowClassName: string;
  inputClassName: string;
  prefixClassName: string;
  id?: string;
  ariaInvalid?: boolean;
}

/**
 * The country prefix is a real combobox: a <button> trigger plus a listbox of
 * options, wired with aria-expanded / aria-controls / aria-activedescendant and
 * fully keyboard operable. Every rule — dial codes, per-country length,
 * formatting, example numbers — comes from libphonenumber-js.
 *
 * libphonenumber-js (~40 KB gzip) is NOT in the page's initial JS: the field
 * first renders from lib/phoneLite (the default country's flag, +998 and
 * placeholder) and loads the library on the first focus of the input or the
 * country selector. Anything typed in the instant before it arrives is passed
 * through as-is and reformatted/revalidated as soon as it does.
 *
 * The field keeps the look it had as a static label: the same bordered row, the
 * same divider, the same input classes. Only the prefix became clickable, and
 * the listbox is an absolutely positioned overlay that adds nothing to the flow.
 */
export default function PhoneInput({
  locale,
  value,
  onChange,
  error,
  onBlur,
  className,
  rowClassName,
  inputClassName,
  prefixClassName,
  id,
  ariaInvalid,
}: PhoneInputProps) {
  const { t } = useTranslation();
  const [country, setCountry] = useState<CountryCode>(DEFAULT_COUNTRY);
  const [lib, setLib] = useState<PhoneLib | null>(null);
  const ensureLib = useCallback(() => {
    void loadPhone().then((loaded) => setLib(() => loaded));
  }, []);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const listboxId = useId();
  const optionId = (index: number) => `${listboxId}-option-${index}`;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const options = useMemo(
    () => (lib ? lib.countryOptions(locale) : [defaultCountryOption(locale)]),
    [lib, locale],
  );
  const filtered = useMemo(
    () => options.filter((option) => matchesQuery(option, query)),
    [options, query],
  );
  const selected =
    options.find((option) => option.code === country) ?? options[0];

  const placeholder = useMemo(
    () => (lib ? lib.examplePlaceholder(country) : DEFAULT_PLACEHOLDER),
    [lib, country],
  );

  // Close on outside click, and on Escape from anywhere inside.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  // Focus the search box when the list opens; keep the active option in view.
  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`#${CSS.escape(optionId(activeIndex))}`)
      ?.scrollIntoView({ block: "nearest" });
  });

  function emit(display: string, nextCountry: CountryCode) {
    if (!lib) {
      // Library still loading (only ever the default country): pass the input
      // through; the effect below reformats and validates it on arrival.
      const digits = display.replace(/[^\d]/g, "");
      onChange({
        display,
        e164: digits ? `+${DEFAULT_CALLING_CODE}${digits}` : "",
        isValid: false,
      });
      return;
    }
    onChange({
      display,
      e164: lib.toE164(display, nextCountry),
      isValid: lib.isValidFor(display, nextCountry),
    });
  }

  // When the library arrives, bring a value typed in the meantime into its
  // formatted, validated form. An effect event: it reads the latest value and
  // country but runs only when `lib` changes, not on every keystroke.
  const reformatOnArrival = useEffectEvent((loaded: PhoneLib) => {
    const digits = value.replace(/[^\d]/g, "");
    if (!digits) return;
    const display = loaded.formatAsYouType(digits, country);
    onChange({
      display,
      e164: loaded.toE164(display, country),
      isValid: loaded.isValidFor(display, country),
    });
  });
  useEffect(() => {
    if (lib) reformatOnArrival(lib);
  }, [lib]);

  function selectCountry(next: CountryCode) {
    setCountry(next);
    setOpen(false);
    setQuery("");
    // Reformats the digits already entered rather than clearing them.
    const digits = value.replace(/[^\d]/g, "");
    emit(digits ? (lib ? lib.formatAsYouType(digits, next) : digits) : "", next);
    // Focus returns to the number input, where typing continues.
    inputRef.current?.focus();
  }

  function onTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActiveIndex(0);
      setOpen(true);
    }
  }

  function onSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, filtered.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const option = filtered[activeIndex];
      if (option) selectCountry(option.code);
    }
  }

  return (
    <div className={className} ref={wrapperRef}>
      <div className={cn("relative", rowClassName)}>
        {/* Was a static <span>; now the combobox trigger. Same classes, plus
            the cursor and focus affordances a button needs. */}
        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-label={selected ? `${selected.name} +${selected.callingCode}` : "Country"}
          onPointerDown={ensureLib}
          onFocus={ensureLib}
          onClick={() => {
            ensureLib();
            setActiveIndex(0);
            setOpen((was) => !was);
          }}
          onKeyDown={onTriggerKeyDown}
          className={cn(prefixClassName, "cursor-pointer outline-none")}
        >
          {selected ? `${flagEmoji(selected.code)} +${selected.callingCode}` : "+"}
        </button>

        <input
          ref={inputRef}
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder={placeholder}
          value={value}
          aria-invalid={ariaInvalid}
          onFocus={ensureLib}
          onBlur={onBlur}
          onChange={(event) => {
            const raw = event.target.value;
            if (!lib) {
              emit(raw, country);
              return;
            }
            // A pasted value carrying its own country code switches the
            // selector; otherwise it is read as a national number.
            if (/^\+|^\d{11,}$/.test(raw.trim())) {
              const pasted = lib.parsePasted(raw, country);
              if (pasted) {
                setCountry(pasted.country);
                emit(pasted.national, pasted.country);
                return;
              }
            }
            emit(lib.formatAsYouType(raw, country), country);
          }}
          onPaste={(event) => {
            // Without the library the paste goes through as plain input and
            // is reformatted on arrival (the field is focused, so it loads).
            if (!lib) return;
            const text = event.clipboardData.getData("text");
            const pasted = lib.parsePasted(text, country);
            if (!pasted) return;
            event.preventDefault();
            setCountry(pasted.country);
            emit(pasted.national, pasted.country);
          }}
          className={inputClassName}
        />

        {open && (
          <div className="absolute top-full left-0 z-30 mt-1 w-full max-w-xs overflow-hidden rounded-md border border-line-200 bg-white shadow-lg">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              onKeyDown={onSearchKeyDown}
              aria-label={t("a11y.searchCountry")}
              aria-controls={listboxId}
              aria-activedescendant={
                filtered[activeIndex] ? optionId(activeIndex) : undefined
              }
              className="w-full border-b border-line-200 px-3 py-2 text-sm text-ink-900 outline-none placeholder:text-ink-500"
              placeholder={t("a11y.countryPlaceholder")}
            />
            <ul
              ref={listRef}
              id={listboxId}
              role="listbox"
              className="max-h-60 overflow-y-auto py-1"
            >
              {filtered.map((option: CountryOption, index) => (
                <li
                  key={option.code}
                  id={optionId(index)}
                  role="option"
                  aria-selected={option.code === country}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectCountry(option.code);
                  }}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm",
                    index === activeIndex ? "bg-light" : "bg-white",
                    option.code === country ? "text-brand-600" : "text-ink-900",
                  )}
                >
                  <span aria-hidden="true">{flagEmoji(option.code)}</span>
                  <span className="flex-1 truncate">{option.name}</span>
                  <span className="text-ink-500">+{option.callingCode}</span>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="px-3 py-2 text-sm text-ink-500">—</li>
              )}
            </ul>
          </div>
        )}
      </div>

      {error && <p className="mt-1.5 text-sm text-brand-600">{error}</p>}
    </div>
  );
}
