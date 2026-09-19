import React, { useState, useEffect } from 'react';

export const ProductImage = ({ src, alt, fallbackIcon: FallbackIcon }) => {
    const [hasError, setHasError] = useState(false);
    useEffect(() => { setHasError(false); }, [src]);

    // Extract string URL if src is an object (e.g. from WooCommerce)
    const imgUrl = typeof src === 'object' && src !== null ? src.src : src;

    if (!imgUrl || hasError) {
        return <FallbackIcon size={32} className="text-gray-300" />;
    }

    const isVideo = /\.(mp4|mov|webm|mkv)(\?|$)/i.test(imgUrl);

    if (isVideo) {
        return (
            <video 
                src={imgUrl} 
                autoPlay 
                muted 
                loop 
                playsInline
                className="w-full h-full object-contain mix-blend-multiply"
                onError={() => setHasError(true)}
            />
        );
    }

    return <img src={imgUrl} alt={alt} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105" onError={() => setHasError(true)} />;
};
