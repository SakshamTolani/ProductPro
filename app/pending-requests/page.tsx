'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loader from '../components/Loader';
import Alert from '../components/Alert';

interface AlertState {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface Review {
  _id: string;
  productId: { title: string };
  changes: {
    title?: string;
    description?: string;
    price?: number;
    imageUrl?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  userId: { email: string };
}

export default function PendingRequests() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchReviews = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/reviews/pending', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        } else {
          throw new Error('Failed to fetch reviews');
        }
      } catch (error) {
        console.error('Error:', error);
        setAlert({ type: 'error', message: 'Failed to load pending requests' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [router]);

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8 text-indigo-900 tracking-tight">Pending Requests</h1>
        {reviews.length === 0 ? (
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <p className="text-xl text-gray-600">There are no pending requests at the moment.</p>
            <Link href="/dashboard" className="mt-4 inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid gap-8">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold mb-2 text-indigo-900">{review.productId.title}</h2>
                      <p className="text-gray-600 mb-1">Author: <span className="font-medium">{review.userId.email}</span></p>
                      <p className="text-gray-600">Submitted on: <span className="font-medium">{new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-700">Proposed Changes:</h3>
                    <ul className="list-none text-gray-600 space-y-1">
                      {review.changes.title && <li>• Title updated</li>}
                      {review.changes.description && <li>• Description modified</li>}
                      {review.changes.price && <li>• Price changed</li>}
                      {review.changes.imageUrl && <li>• New image uploaded</li>}
                    </ul>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4">
                  <Link 
                    href={`/pending-requests/${review._id}`}
                    className="w-full inline-block bg-indigo-600 text-white text-center px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300 ease-in-out"
                  >
                    Review Changes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}