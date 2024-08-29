// app/product/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Loader from '../../components/Loader';
import Link from 'next/link';
import Alert from '../../components/Alert';

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

export default function ProductDetail({ params }: { params: { id: string } }) {
    const [product, setProduct] = useState<Product | null>(null);
    const [originalProduct, setOriginalProduct] = useState<Product | null>(null); // New state to hold original product data
    const [userRole, setUserRole] = useState<string | null>(null);
    const [alert, setAlert] = useState<AlertState | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (!token || !role) {
            router.push('/login');
        } else {
            setUserRole(role);
            fetchProduct();
        }
    }, []);

    const fetchProduct = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/products/${params.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setProduct(data);
            setOriginalProduct(data); // Store the original product data
        } catch (error) {
            console.error('Failed to fetch product:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const uploadImage = async (): Promise<string> => {
        if (!file) throw new Error('No file selected');
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });

        if (!response.ok) throw new Error('Failed to upload image');
        const data = await response.json();
        return data.url;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            let updatedProduct = { ...product };

            if (file) {
                const imageUrl = await uploadImage();
                updatedProduct.imageUrl = imageUrl;
            }

            if (userRole === 'admin') {
                const response = await fetch(`/api/products/${params.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(updatedProduct),
                });
                if (response.ok) {
                    const updatedData = await response.json();
                    setProduct(updatedData);
                    setOriginalProduct(updatedData); // Update the original product data
                    setAlert({ type: 'success', message: 'Product updated successfully' });
                } else {
                    throw new Error('Failed to update product');
                }
            } else {
                const response = await fetch('/api/reviews', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        productId: params.id,
                        changes: updatedProduct,
                    }),
                });
                if (response.ok) {
                    setProduct(originalProduct); // Reset the form fields to the original product data
                    setFile(null); // Reset the file input
                    setAlert({ type: 'success', message: 'Changes submitted for review' });
                } else {
                    throw new Error('Failed to submit review');
                }
            }
        } catch (error) {
            setAlert({ type: 'error', message: error instanceof Error ? error.message : 'An error occurred' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    if (isLoading) return <Loader />;
    if (!product) return <div className="text-center text-red-500">Product not found</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 py-12 px-4 sm:px-6 lg:px-8">
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
            <div className="max-w-6xl mx-auto">
                <div className="bg-white shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-3xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="p-8 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                            <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105">
                                <Image
                                    src={product.imageUrl}
                                    alt={product.title}
                                    layout="fill"
                                    objectFit="cover"
                                    className="rounded-2xl"
                                />
                            </div>
                        </div>
                        <div className="p-8 flex flex-col justify-between">
                            <div>
                                <h1 className="text-4xl font-extrabold mb-4 text-gray-900 leading-tight">{product.title}</h1>
                                <p className="text-xl text-gray-700 mb-6 leading-relaxed">{product.description}</p>
                                <p className="text-3xl font-bold text-indigo-600 mb-8">₹{product.price.toLocaleString()}</p>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={product?.title || ''}
                                        onChange={(e) => setProduct({ ...product, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={product?.description || ''}
                                        onChange={(e) => setProduct({ ...product, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                        rows={4}
                                    ></textarea>
                                </div>
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        value={product?.price || ''}
                                        onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Upload New Image</label>
                                    <input
                                        id="image"
                                        type="file"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all duration-200"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                                >
                                    {userRole === 'admin' ? 'Update Product' : 'Submit for Review'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="mt-8 text-center">
                    <Link href="/dashboard" className="inline-block bg-gray-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-gray-700 transition-all duration-200">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
