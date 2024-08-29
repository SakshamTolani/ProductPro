import React, { useEffect, useState } from 'react';
import { XCircleIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/solid';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
    type: AlertType;
    message: string;
    onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [shouldRender, setShouldRender] = useState(true);

    useEffect(() => {
        const visibilityTimer = setTimeout(() => {
            setIsVisible(false);
        }, 3000);

        const renderTimer = setTimeout(() => {
            setShouldRender(false);
            if (onClose) onClose();
        }, 3300); // 300ms for fade-out animation

        return () => {
            clearTimeout(visibilityTimer);
            clearTimeout(renderTimer);
        };
    }, [onClose]);

    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white',
        info: 'bg-blue-500 text-white'
    };

    const icons = {
        success: <CheckCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />,
        error: <XCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />,
        warning: <ExclamationCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />,
        info: <InformationCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
    };

    if (!shouldRender) return null;

    return (
        <div className="fixed bottom-5 right-5 z-50">
            <div
                className={`
                    rounded-lg shadow-lg p-4 ${colors[type]} max-w-sm
                    transition-opacity duration-300 ease-in-out
                    ${isVisible ? 'opacity-100' : 'opacity-0'}
                `}
            >
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        {icons[type]}
                    </div>
                    <div className="ml-3 flex-1">
                        <p className="text-sm font-medium">{message}</p>
                    </div>
                    {onClose && (
                        <div className="ml-4 flex-shrink-0 flex">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsVisible(false);
                                    setTimeout(() => {
                                        setShouldRender(false);
                                        onClose();
                                    }, 300);
                                }}
                                className="inline-flex text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
                            >
                                <span className="sr-only">Close</span>
                                <XCircleIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Alert;