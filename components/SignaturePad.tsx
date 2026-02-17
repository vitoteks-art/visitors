import React, { useRef, useEffect, useState } from 'react';
import { Eraser } from 'lucide-react';

interface SignaturePadProps {
    onSave: (signature: string | null) => void;
    defaultValue?: string | null;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, defaultValue }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const lastPos = useRef({ x: 0, y: 0 });
    const dprRef = useRef<number>(1);

    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            dprRef.current = dpr;

            // Step 1: Save existing content if any (in CSS pixels)
            let tempImage: string | null = null;
            if (canvas.width > 0 && canvas.height > 0) {
                try {
                    tempImage = canvas.toDataURL('image/png');
                } catch {
                    tempImage = null;
                }
            }

            // Step 2: Update internal resolution (device pixels)
            canvas.width = Math.max(1, Math.floor(rect.width * dpr));
            canvas.height = Math.max(1, Math.floor(rect.height * dpr));

            // IMPORTANT: reset transform before applying DPR transform (prevents cumulative scaling)
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // Step 3: Re-apply styles (as resize clears them)
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Step 4: Restore content if it existed
            if (tempImage) {
                const img = new Image();
                img.onload = () => {
                    // draw into CSS pixel space (because of DPR transform)
                    ctx.drawImage(img, 0, 0, rect.width, rect.height);
                };
                img.src = tempImage;
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load initial defaultValue only once when canvas is ready
    useEffect(() => {
        if (defaultValue && !hasSignature) {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx || !ctx.canvas.width) return;

            const rect = canvas.getBoundingClientRect();
            const dpr = dprRef.current || (window.devicePixelRatio || 1);

            // Ensure transform is correct before drawing defaultValue
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
            img.src = defaultValue;
            setHasSignature(true);
        }
    }, [defaultValue, hasSignature]);

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();

        let clientX, clientY;
        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as MouseEvent).clientX;
            clientY = (e as MouseEvent).clientY;
        }

        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const pos = getCoordinates(e);
        lastPos.current = pos;
        setIsDrawing(true);

        // Prevent page scroll while signing (especially on mobile)
        if ('touches' in e && e.cancelable) e.preventDefault();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            onSave(dataUrl);
            setHasSignature(true);
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        if (e.cancelable) e.preventDefault();

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { x, y } = getCoordinates(e);

        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        lastPos.current = { x, y };
    };

    const clear = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Clear in device pixel space
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Restore DPR transform for continued drawing
                const dpr = dprRef.current || (window.devicePixelRatio || 1);
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

                onSave(null);
                setHasSignature(false);
            }
        }
    };

    return (
        <div className="space-y-2">
            <div className="relative border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white overflow-hidden h-40">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                    onMouseMove={draw}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchMove={draw}
                />
                <button
                    type="button"
                    onClick={clear}
                    className="absolute top-2 right-2 p-2 bg-gray-100/80 hover:bg-gray-200 text-gray-600 rounded-lg transition-all backdrop-blur-sm"
                    title="Clear Signature"
                >
                    <Eraser className="h-4 w-4" />
                </button>
                {!hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 opacity-50 text-sm font-medium tracking-wide">
                        Sign here to confirm check-in
                    </div>
                )}
            </div>
        </div>
    );
};

export default SignaturePad;
