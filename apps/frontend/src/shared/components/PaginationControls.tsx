import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

type PaginationItem = number | 'ellipsis';

const MAX_VISIBLE_PAGES = 5;

const buildPaginationItems = (
  currentPage: number,
  totalPages: number,
): PaginationItem[] => {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 'ellipsis', totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      'ellipsis',
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    'ellipsis',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis',
    totalPages,
  ];
};

export const PaginationControls = ({
  currentPage,
  pageSize,
  totalItems,
  totalPages,
  onPageChange,
}: PaginationControlsProps) => {
  if (totalItems === 0) {
    return null;
  }

  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);
  const paginationItems = buildPaginationItems(currentPage, totalPages);

  return (
    <nav
      aria-label='Paginacion de resultados'
      className='flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-white/85 px-4 py-3 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.35)] sm:flex-row sm:items-center sm:justify-between'
    >
      <div className='text-sm text-slate-600'>
        Mostrando <span className='font-medium text-slate-950'>{firstItem}</span>
        {' - '}
        <span className='font-medium text-slate-950'>{lastItem}</span>
        {' de '}
        <span className='font-medium text-slate-950'>{totalItems}</span>
      </div>

      <div className='flex items-center justify-between gap-2 sm:justify-end'>
        <button
          type='button'
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className='inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400'
        >
          <ChevronLeft className='h-4 w-4' />
          Anterior
        </button>

        <div className='hidden items-center gap-2 sm:flex'>
          {paginationItems.map((item, index) =>
            item === 'ellipsis' ? (
              <span
                key={`ellipsis-${index}`}
                className='px-1 text-sm font-medium text-slate-400'
              >
                ...
              </span>
            ) : (
              <button
                key={item}
                type='button'
                onClick={() => onPageChange(item)}
                aria-current={item === currentPage ? 'page' : undefined}
                className={`h-10 min-w-10 rounded-2xl px-3 text-sm font-medium transition ${
                  item === currentPage
                    ? 'bg-slate-950 text-white'
                    : 'border border-slate-200 text-slate-700 hover:border-sky-300 hover:bg-sky-50'
                }`}
              >
                {item}
              </button>
            ),
          )}
        </div>

        <span className='text-sm font-medium text-slate-600 sm:hidden'>
          {currentPage} / {totalPages}
        </span>

        <button
          type='button'
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className='inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400'
        >
          Siguiente
          <ChevronRight className='h-4 w-4' />
        </button>
      </div>
    </nav>
  );
};
