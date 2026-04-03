import { useAuthStore } from '@/features/auth/store/auth.store';

export const LoginPage = () => {
  const { usuario, login, logout } = useAuthStore();

  return (
    <div>
      <h1>Login</h1>

      <button
        onClick={() => login({ id: '1', nombre: 'Álvaro', rol: 'ADMIN' })}
      >
        Login
      </button>

      <button onClick={logout}>Logout</button>

      <pre>{JSON.stringify(usuario, null, 2)}</pre>
    </div>
  );
};
