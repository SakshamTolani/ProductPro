'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';

interface AlertState {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface Submission {
  _id: string;
  productId: string;
  productTitle: string;
  changes: {
    title?: string;
    description?: string;
    price?: number;
    imageUrl?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function MySubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        const response = await fetch('/api/submissions', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const submissionsData = await response.json();
          setSubmissions(submissionsData);
        } else {
          throw new Error('Failed to fetch submissions');
        }
      } catch (error) {
        console.error('Error:', error);
        setAlert({ type: 'error', message: 'Failed to load submissions' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

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
        <h1 className="text-4xl font-extrabold mb-8 text-gray-800 tracking-tight">My Submissions</h1>
        {submissions.length === 0 ? (
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <p className="text-xl text-gray-600">You haven&apos;t made any submissions yet.</p>
            <Link href="/dashboard" className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105">
              Start a New Submission
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {submissions.map((submission) => (
              <div key={submission._id} className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 hover:scale-105">
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2 text-gray-800">{submission.productTitle}</h2>
                  <p className="text-gray-600 mb-2">Status:
                    <span className={`ml-2 font-semibold ${submission.status === 'approved' ? 'text-green-600' :
                        submission.status === 'rejected' ? 'text-red-600' :
                          'text-yellow-600'
                      }`}>
                      {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                    </span>
                  </p>
                  <p className="text-gray-600 mb-4">Submitted on: {new Date(submission.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-700">Proposed Changes:</h3>
                  <ul className="list-none text-gray-600 space-y-2">
                    {submission.changes.title && <li>• Title: {submission.changes.title}</li>}
                    {submission.changes.description && <li>• Description: {submission.changes.description.substring(0, 50)}...</li>}
                    {submission.changes.price && <li>• Price: ₹{submission.changes.price.toFixed(2)}</li>}
                    {submission.changes.imageUrl && <li>• New image uploaded</li>}
                  </ul>
                </div>
                <div className="bg-gray-50 px-6 py-4">
                  <Link href={`/profile/my-submissions/${submission._id}`} className="w-full inline-block bg-blue-600 text-white text-center px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        <Link href="/dashboard" className="mt-12 inline-block bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition duration-300 ease-in-out">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}