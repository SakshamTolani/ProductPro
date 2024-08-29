// app/product/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Loader from '../../../components/Loader';
import Alert from '../../../components/Alert';

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
    const [userRole, setUserRole] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [alert, setAlert] = useState<AlertState | null>(null);
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
            let imageUrl = product?.imageUrl || '';

            if (file) {
                imageUrl = await uploadImage();
            }

            const updatedProduct = {
                ...product,
                imageUrl,
            };

            const response = await fetch(`/api/products/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(updatedProduct),
            });

            if (response.ok) {
                setAlert({ type: 'success', message: 'Product updated successfully' });
            } else {
                throw new Error('Failed to update product');
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
        <div className="min-h-screen bg-gradient-to-r from-blue-100 to-teal-100 py-12 px-4 sm:px-6 lg:px-8">
            {alert && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert(null)}
                />
            )}
            <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                <form onSubmit={handleSubmit} className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Details</h2>
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            id="title"
                            type="text"
                            value={product.title}
                            onChange={(e) => setProduct({ ...product, title: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            id="description"
                            value={product.description}
                            onChange={(e) => setProduct({ ...product, description: e.target.value })}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                        <input
                            id="price"
                            type="number"
                            value={product.price}
                            onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Current Image</label>
                        <Image src={product.imageUrl} alt={product.title} width={200} height={200} className="mt-1 rounded-md" />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700">Upload New Image</label>
                        <input
                            id="image"
                            type="file"
                            onChange={handleFileChange}
                            accept="image/*"
                            className="mt-1 block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        {userRole === 'admin' ? 'Update Product' : 'Submit for Review'}
                    </button>
                </form>
            </div>
        </div>
    );
}
