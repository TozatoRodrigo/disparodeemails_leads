import { useState } from 'react';
import { Mail } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { Particles } from '../magicui/particles';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      <Particles
        className="absolute inset-0 -z-10"
        quantity={50}
        ease={80}
        color="#ff6b35"
        refresh={false}
      />

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Email Dispatcher</h1>
          <p className="text-zinc-400 mt-2">Sistema de disparo de emails via Make.com</p>
        </div>

        <div className="transition-all duration-300">
          {isLogin ? (
            <LoginForm onToggle={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onToggle={() => setIsLogin(true)} />
          )}
        </div>

        <p className="text-center text-xs text-zinc-600">
          Ao criar uma conta, você concorda com nossos termos de uso.
        </p>
      </div>
    </div>
  );
}

