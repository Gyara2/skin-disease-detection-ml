import { Check, ChevronDown } from 'lucide-react';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';

export interface CustomSelectOption<TValue extends string = string> {
  value: TValue;
  label: string;
  description?: string;
}

interface CustomSelectProps<TValue extends string = string> {
  label: string;
  value: TValue;
  options: readonly CustomSelectOption<TValue>[];
  onChange: (value: TValue) => void;
  disabled?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  triggerClassName?: string;
  menuClassName?: string;
  placeholder?: string;
}

export const CustomSelect = <TValue extends string = string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
  containerClassName = '',
  labelClassName = '',
  triggerClassName = '',
  menuClassName = '',
  placeholder = 'Selecciona una opcion',
}: CustomSelectProps<TValue>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const labelId = useId();
  const listboxId = useId();

  const selectedIndex = useMemo(
    () => options.findIndex((option) => option.value === value),
    [options, value],
  );
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [isOpen, selectedIndex]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsOpen(false);
    };

    const handleWindowKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
        return;
      }

      if (!options.length) {
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const nextIndex = Math.min(activeIndex + 1, options.length - 1);
        setActiveIndex(nextIndex);
        optionRefs.current[nextIndex]?.focus();
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        const nextIndex = Math.max(activeIndex - 1, 0);
        setActiveIndex(nextIndex);
        optionRefs.current[nextIndex]?.focus();
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleWindowKeyDown);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleWindowKeyDown);
    };
  }, [activeIndex, isOpen, options]);

  useEffect(() => {
    if (!disabled) {
      return;
    }

    setIsOpen(false);
  }, [disabled]);

  const focusOption = (index: number) => {
    window.requestAnimationFrame(() => {
      optionRefs.current[index]?.focus();
    });
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (disabled || !options.length) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen((currentOpen) => !currentOpen);

      if (!isOpen) {
        focusOption(selectedIndex >= 0 ? selectedIndex : 0);
      }
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      focusOption(selectedIndex >= 0 ? selectedIndex : 0);
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsOpen(true);
      focusOption(selectedIndex >= 0 ? selectedIndex : options.length - 1);
    }
  };

  const handleOptionSelect = (nextValue: TValue) => {
    onChange(nextValue);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div
      ref={rootRef}
      className={`relative ${isOpen ? 'z-50' : ''} ${containerClassName}`}
    >
      <span
        id={labelId}
        className={`block text-xs font-medium uppercase tracking-[0.24em] text-slate-500 ${labelClassName}`}
      >
        {label}
      </span>

      <button
        ref={buttonRef}
        type='button'
        aria-haspopup='listbox'
        aria-expanded={isOpen}
        aria-labelledby={labelId}
        aria-controls={isOpen ? listboxId : undefined}
        onClick={() => {
          if (!disabled) {
            setIsOpen((currentOpen) => !currentOpen);
          }
        }}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        className={`mt-2 flex w-full items-center justify-between gap-3 rounded-[20px] text-left text-sm font-medium text-slate-950 transition outline-none ${
          disabled
            ? 'cursor-not-allowed text-slate-400'
            : isOpen
              ? 'text-slate-950'
              : 'hover:text-slate-950'
        } ${triggerClassName}`}
      >
        <span className='min-w-0 flex-1 truncate'>
          {selectedOption?.label ?? placeholder}
        </span>

        <span
          className={`flex h-9 w-9 items-center justify-center rounded-2xl border transition ${
            disabled
              ? 'border-slate-200 bg-slate-100 text-slate-300'
              : isOpen
                ? 'border-sky-200 bg-sky-50 text-sky-700 shadow-[0_10px_24px_-18px_rgba(14,165,233,0.7)]'
                : 'border-slate-200 bg-white/80 text-slate-500'
          }`}
        >
          <ChevronDown
            className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {isOpen ? (
        <div
          id={listboxId}
          role='listbox'
          aria-labelledby={labelId}
          className={`relative mt-3 z-50 overflow-hidden rounded-[24px] border border-slate-200/80 bg-white/95 p-2 shadow-[0_26px_70px_-36px_rgba(15,23,42,0.4)] backdrop-blur-xl md:absolute md:left-0 md:right-0 md:top-[calc(100%+0.75rem)] md:mt-0 ${menuClassName}`}
        >
          <div className='max-h-[min(16rem,calc(100vh-10rem))] space-y-1 overflow-y-auto overscroll-contain md:max-h-72'>
            {options.map((option, index) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  ref={(node) => {
                    optionRefs.current[index] = node;
                  }}
                  type='button'
                  role='option'
                  aria-selected={isSelected}
                  onClick={() => handleOptionSelect(option.value)}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  className={`flex w-full items-start justify-between gap-3 rounded-[20px] px-3 py-3 text-left transition outline-none ${
                    isSelected
                      ? 'bg-[linear-gradient(135deg,rgba(224,242,254,0.95)_0%,rgba(239,246,255,0.9)_100%)] text-slate-950'
                      : activeIndex === index
                        ? 'bg-slate-50 text-slate-950'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  <span className='min-w-0'>
                    <span className='block text-sm font-medium'>
                      {option.label}
                    </span>
                    {option.description ? (
                      <span className='mt-1 block text-xs leading-5 text-slate-500'>
                        {option.description}
                      </span>
                    ) : null}
                  </span>

                  <span
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border ${
                      isSelected
                        ? 'border-sky-200 bg-white text-sky-700'
                        : 'border-transparent bg-transparent text-slate-300'
                    }`}
                  >
                    <Check className='h-4 w-4' />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
};
