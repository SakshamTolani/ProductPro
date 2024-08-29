'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Loader from '../../../components/Loader';
import Alert from '../../../components/Alert';
import Image from 'next/image';

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
  feedback?: string;
}

export default function SubmissionDetail({ params }: { params: { id: string } }) {
  const [submission, setSubmission] = useState<Submission | null>(null);
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
        const response = await fetch(`/api/submissions/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const submissionData = await response.json();
          setSubmission(submissionData);
          console.log(submissionData);

        } else {
          throw new Error('Failed to fetch submission details');
        }
      } catch (error) {
        console.error('Error:', error);
        setAlert({ type: 'error', message: 'Failed to load submission details' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  if (isLoading) return <Loader />;
  if (!submission) return <div>Submission not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-white py-12 px-4 sm:px-6 lg:px-8">
      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="bg-blue-600 text-white py-6 px-8">
          <h1 className="text-3xl font-bold">{submission.productTitle}</h1>
          <p className="text-blue-100 mt-2">Submission ID: {submission._id}</p>
        </div>
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
              }`}>
              {submission?.status?.charAt(0).toUpperCase() + submission.status?.slice(1)}
            </span>
            <span className="text-gray-500">
              Submitted on {new Date(submission.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Proposed Changes</h2>
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            {submission.changes.title && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Title</h3>
                <p className="text-gray-900">{submission.changes.title}</p>
              </div>
            )}
            {submission.changes.description && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Description</h3>
                <p className="text-gray-900">{submission.changes.description}</p>
              </div>
            )}
            {submission.changes.price && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Price</h3>
                <p className="text-gray-900">₹{submission.changes.price.toFixed(2)}</p>
              </div>
            )}
            {submission.changes.imageUrl && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">New Image</h3>
                <Image src={submission.changes.imageUrl} alt="New product image" className="w-full h-64 object-cover rounded-lg" />
              </div>
            )}
          </div>

          {submission.feedback && (
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">Feedback</h2>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{submission.feedback}</p>
            </div>
          )}

          <div className="flex justify-between">
            <Link href="/profile/my-submissions" className="inline-block bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors">
              Back to My Submissions
            </Link>
            <Link href={`/product/${submission.productId}`} className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              View Product
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}