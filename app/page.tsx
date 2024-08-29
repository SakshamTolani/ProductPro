'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Camera } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl text-center transform hover:scale-105 transition-all duration-300">
        <div className="flex justify-center">
          <Camera size={64} className="text-purple-600" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          ProductPro
        </h1>
        <p className="mt-2 text-xl text-gray-600">
          Streamline your product management workflow
        </p>
        <div className="mt-8 space-y-4">
          <Link href="/login" className="w-full inline-flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            Login
          </Link>
          <Link href="/register" className="w-full inline-flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}