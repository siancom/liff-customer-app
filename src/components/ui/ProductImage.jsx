import React, { useState, useEffect } from 'react';

export const ProductImage = ({ src, alt, fallbackIcon: FallbackIcon }) => {
    const [hasError, setHasError] = useState(false);
    useEffect(() => { setHasError(false); }, [src]);

    if (!src || hasError) {
        return <FallbackIcon size={32} className="text-gray-300" />;
    }
    return <img src={src} alt={alt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" onError={() => setHasError(true)} />;
};
