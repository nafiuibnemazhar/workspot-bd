'use client';

import { useState } from 'react';
// FIX: Import from '/react' here as well
import { useMutation } from '@apollo/client/react'; 
import { LOGIN_MUTATION } from '@/lib/mutations';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // The Hook that talks to WordPress
  // Notice we removed the `{ client }` option. The Provider handles it.
  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      // 1. Save the Token
      const token = data.login.authToken;
      localStorage.setItem('workspot_token', token);
      localStorage.setItem('workspot_user', JSON.stringify(data.login.user));
      
      // 2. Redirect to Dashboard (or Home)
      router.push('/dashboard')
    },
    onError: (err) => {
      setError('Invalid username or password. Please try again.');
      console.error(err);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); 
    login({ variables: { username: email, password: password } });
  };

  return (
    <div className="min-h-screen bg-brand-light flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-brand-beige">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex bg-brand-orange text-white p-2 rounded-xl mb-4 shadow-lg shadow-brand-orange/20">
            <MapPin size={24} fill="currentColor" />
          </div>
          <h1 className="text-2xl font-extrabold text-brand-dark">Welcome Back</h1>
          <p className="text-brand-dark/50 mt-2">Sign in to manage your workspace listings.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100 flex items-center justify-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Username / Email</label>
            <input 
              type="text" 
              required
              className="w-full p-4 bg-brand-light/30 border border-brand-beige rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all font-medium"
              placeholder="admin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              required
              className="w-full p-4 bg-brand-light/30 border border-brand-beige rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all font-medium"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-dark text-white font-bold py-4 rounded-xl hover:bg-brand-orange transition-colors shadow-lg hover:shadow-brand-orange/20 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center border-t border-brand-beige/50 pt-6">
          <p className="text-sm text-brand-dark/50">
            Don't have an account?{' '}
            <Link href="/register" className="text-brand-orange font-bold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}