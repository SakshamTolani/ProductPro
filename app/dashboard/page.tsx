'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

interface AlertState {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'admin' | 'team_member' | null>(null);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const [productsResponse, profileResponse] = await Promise.all([
          fetch('/api/products', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/user/profile', { headers: { Authorization: `Bearer ${token}` } })
        ]);

        if (productsResponse.ok && profileResponse.ok) {
          const productsData = await productsResponse.json();
          const profileData = await profileResponse.json();
          setProducts(productsData);
          setUserRole(profileData.role);
        } else {
          throw new Error('Failed to fetch data');
        }
      } catch (error) {
        console.error('Error:', error);
        setAlert({ type: 'error', message: 'Failed to fetch product details.' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">Dashboard</h1>
          <div className="space-x-4">
            {/* {userRole === 'team_member' ? (
              <Link href="/profile/my-submissions" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
                My Submissions
              </Link>
            ) : (
              <Link href="/pending-requests" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
                View Pending Requests
              </Link>
            )} */}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Link href={`/product/${product._id}`} key={product._id}>
              <div className="bg-white shadow-lg rounded-lg overflow-hidden transition-transform duration-300 transform hover:-translate-y-1 hover:scale-105 hover:shadow-2xl">
                <img src={product.imageUrl} alt={product.title} className="w-full h-48 object-cover mb-4 rounded" />
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2 text-gray-800">{product.title}</h2>
                  <p className="text-gray-600 mb-2">{product.description.substring(0, 100)}...</p>
                  <p className="text-lg font-bold text-gray-800">₹{product.price.toFixed(2)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
