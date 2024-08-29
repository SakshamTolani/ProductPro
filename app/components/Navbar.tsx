'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

interface NavLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, className }) => (
    <Link href={href} className={className}>
        {children}
    </Link>
);

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [role, setRole] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        const userRole = localStorage.getItem('role');
        setRole(userRole);
    }, [isLoggedIn, router]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setIsLoggedIn(false);
        setRole(null);
        router.push('/login');
    };

    return (
        <nav className="bg-gradient-to-r from-blue-700 via-indigo-800 to-purple-900 text-white shadow-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative flex items-center justify-between h-20">
                    {/* Mobile menu button */}
                    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-all duration-300 ease-in-out"
                            aria-controls="mobile-menu"
                            aria-expanded={isOpen}
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? (
                                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                    {/* Logo and navigation links */}
                    <div className="flex-1 flex items-center justify-between sm:items-stretch sm:justify-start">
                        <div className="flex-shrink-0 flex items-center">
                            <NavLink href="/" className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-indigo-300 to-purple-200 hover:from-blue-100 hover:via-indigo-200 hover:to-purple-100 transition-all duration-300 ease-in-out">
                                ProductPro
                            </NavLink>
                        </div>
                        {isLoggedIn && (
                            <div className="hidden sm:flex sm:ml-10 sm:space-x-4">
                                <NavLink href="/dashboard" className="text-indigo-100 hover:bg-indigo-700 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105">
                                    Dashboard
                                </NavLink>
                                <NavLink href="/profile" className="text-indigo-100 hover:bg-indigo-700 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105">
                                    Profile
                                </NavLink>
                                {role === 'admin' && (
                                    <NavLink href="/pending-requests" className="text-indigo-100 hover:bg-indigo-700 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105">
                                        Pending Requests
                                    </NavLink>
                                )}
                                {role === 'team_member' && (
                                    <NavLink href="/profile/my-submissions" className="text-indigo-100 hover:bg-indigo-700 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out transform hover:scale-105">
                                        My Submissions
                                    </NavLink>
                                )}
                            </div>
                        )}
                    </div>
                    {isLoggedIn && (
                        <div className="hidden sm:flex sm:ml-auto">
                            <button
                                onClick={handleLogout}
                                className="text-indigo-100 bg-indigo-700 hover:bg-indigo-600 px-6 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform hover:scale-105"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* Mobile menu */}
            <div 
                className={`${
                    isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                } sm:hidden transition-all duration-300 ease-in-out overflow-hidden`} 
                id="mobile-menu"
            >
                <div className="px-2 pt-2 pb-3 space-y-1 bg-indigo-800">
                    <NavLink href="/dashboard" className="text-indigo-100 hover:bg-indigo-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ease-in-out">
                        Dashboard
                    </NavLink>
                    <NavLink href="/profile" className="text-indigo-100 hover:bg-indigo-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ease-in-out">
                        Profile
                    </NavLink>
                    {role === 'admin' && (
                        <NavLink href="/pending-requests" className="text-indigo-100 hover:bg-indigo-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ease-in-out">
                            Pending Requests
                        </NavLink>
                    )}
                    {role === 'team_member' && (
                        <NavLink href="/my-submissions" className="text-indigo-100 hover:bg-indigo-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ease-in-out">
                            My Submissions
                        </NavLink>
                    )}
                    {isLoggedIn && (
                        <button
                            onClick={handleLogout}
                            className="text-indigo-100 bg-indigo-700 hover:bg-indigo-600 block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-all duration-300 ease-in-out"
                        >
                            Logout
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;