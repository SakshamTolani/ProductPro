'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '../../components/Loader';
import Alert from '../../components/Alert';
import Image from 'next/image';

interface AlertState {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
}

interface ProductId {
    _id: string;
}
interface UserId {
    _id: string;
    email: string;
    role: string;
    __v: string;
}

interface Review {
    _id: string;
    productId: ProductId;  // Update productId type here
    userId: UserId;
    changes: {
        title?: string;
        description?: string;
        price?: number;
        imageUrl?: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

interface Product {
    _id: string;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
}

export default function PendingRequestDetail({ params }: { params: { id: string } }) {
    const [review, setReview] = useState<Review | null>(null);
    const [user, setUser] = useState<UserId | null>(null);
    const [product, setProduct] = useState<Product | null>(null);
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
                // Fetch review first
                const reviewResponse = await fetch(`/api/reviews/${params.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!reviewResponse.ok) throw new Error('Failed to fetch review');

                const reviewData = await reviewResponse.json();

                // Redirect if the review has already been processed
                if (reviewData.status !== 'pending') {
                    router.push('/dashboard');
                    setAlert({ type: 'warning', message: 'This request has already been processed.' });
                    return;
                }

                setReview(reviewData);

                // Fetch product only if review was successfully fetched and has a productId
                if (reviewData.productId) {
                    const productResponse = await fetch(`/api/products/${reviewData.productId._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (productResponse.ok) {
                        const productData = await productResponse.json();
                        setProduct(productData);
                    } else {
                        throw new Error('Failed to fetch product');
                    }
                }

                const userResponse = await fetch(`/api/user/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (userResponse.ok) {
                    const data = await userResponse.json();
                    setUser(data);
                } else {
                    throw new Error('Failed to fetch user email');
                }
            } catch (error) {
                console.error('Error:', error);
                setAlert({ type: 'error', message: 'Failed to load request details' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [params.id, router]);

    const handleAction = async (action: 'approve' | 'reject') => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            // Fetch request to the API with the action in the URL
            const response = await fetch(`/api/reviews/${params.id}/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setAlert({ type: 'success', message: `Request ${action}d successfully` });
                router.push('/pending-requests');
            } else {
                throw new Error(`Failed to ${action} request`);
            }
        } catch (error) {
            console.error('Error:', error);
            setAlert({ type: 'error', message: error instanceof Error ? error.message : 'An error occurred' });
        }
    };

    if (isLoading) return <Loader />;
    if (!review || !product) return <div className="text-center text-2xl text-red-600 mt-10">Failed to load request details</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
            <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl">
                <div className="px-8 py-6">
                    <h1 className="text-4xl font-extrabold text-indigo-800 tracking-tight mb-6">Review Request</h1>
                    <div className="bg-indigo-50 rounded-xl p-6 mb-8">
                        <p className="text-lg mb-2 text-gray-700"><span className="font-semibold">Product ID:</span> {review.productId._id}</p>
                        <p className="text-lg mb-2 text-gray-700"><span className="font-semibold">Author:</span> {user?.email}</p>
                        <p className="text-lg mb-2 text-gray-700"><span className="font-semibold">Submitted on:</span> {new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>

                    <h2 className="text-2xl font-semibold mb-6 text-indigo-700">Proposed Changes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {Object.entries(review.changes).map(([key, value]) => {
                            const actualValue = product ? (product as any)[key] : 'N/A';

                            if (actualValue !== value) {
                                return (
                                    <div key={key} className="bg-yellow-50 p-6 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:bg-yellow-100">
                                        <p className="font-semibold text-xl text-gray-800 mb-3 capitalize">{key}</p>
                                        {key === 'imageUrl' ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-red-600 font-medium mb-2">Current:</p>
                                                    <Image src={actualValue} alt="Current Image" className="w-full h-48 object-cover rounded-lg" />
                                                </div>
                                                <div>
                                                    <p className="text-green-600 font-medium mb-2">Proposed:</p>
                                                    <Image src={value as string} alt="Proposed Image" className="w-full h-48 object-cover rounded-lg" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <p className="text-red-600"><span className="font-medium">Current:</span> {actualValue}</p>
                                                <p className="text-green-600"><span className="font-medium">Proposed:</span> {value}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>

                    <div className="flex justify-end space-x-6">
                        <button
                            onClick={() => handleAction('reject')}
                            className="bg-red-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-red-600 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                        >
                            Reject
                        </button>
                        <button
                            onClick={() => handleAction('approve')}
                            className="bg-green-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                        >
                            Approve
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
