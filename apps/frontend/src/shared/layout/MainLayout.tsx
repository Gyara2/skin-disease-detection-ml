import { Outlet } from 'react-router-dom';

export const MainLayout = () => {
  return (
    <div className='flex h-screen'>
      {/* Sidebar */}
      <aside className='w-64 bg-gray-800 text-white p-4'>Sidebar</aside>

      {/* Main */}
      <div className='flex-1 flex flex-col'>
        {/* Header */}
        <header className='h-16 bg-gray-100 flex items-center px-4'>
          Header
        </header>

        {/* Content */}
        <main className='flex-1 p-4 bg-gray-50'>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
