import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Eraser } from 'lucide-react';

interface SignaturePadProps {
    onSave: (signature: string | null) => void;
    defaultValue?: string | null;
}

type Point = { x: number; y: number; move: boolean };

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, defaultValue }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    // Keep points in CSS-pixel coordinates so resizing/redrawing is stable.
    const pointsRef = useRef<Point[]>([]);
    const dprRef = useRef<number>(1);
    const imageFallbackRef = useRef<string | null>(null); // used when defaultValue is provided (no points)

    const applyCanvasSizing = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        dprRef.current = dpr;

        canvas.width = Math.max(1, Math.floor(rect.width * dpr));
        canvas.height = Math.max(1, Math.floor(rect.height * dpr));

        // Reset transform and apply DPR transform so we can draw in CSS pixels.
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Clear in CSS pixel space.
        ctx.clearRect(0, 0, rect.width, rect.height);

        // Redraw existing signature.
        if (pointsRef.current.length > 0) {
            ctx.beginPath();
            for (const p of pointsRef.current) {
                if (p.move) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
        } else if (imageFallbackRef.current) {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
            img.src = imageFallbackRef.current;
        }
    }, []);

    useEffect(() => {
        applyCanvasSizing();
        window.addEventListener('resize', applyCanvasSizing);
        return () => window.removeEventListener('resize', applyCanvasSizing);
    }, [applyCanvasSizing]);

    useEffect(() => {
        if (defaultValue && !hasSignature) {
            imageFallbackRef.current = defaultValue;
            setHasSignature(true);
            // draw it
            applyCanvasSizing();
        }
    }, [defaultValue, hasSignature, applyCanvasSizing]);

    const getPointFromPointerEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const finishAndSave = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const url = canvas.toDataURL('image/png');
        onSave(url);
        setHasSignature(true);
    }, [onSave]);

    const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
        // Left mouse button only; for touch/pen pointerType isn't mouse.
        if (e.pointerType === 'mouse' && e.button !== 0) return;

        // If we had a default image, user is now drawing a real signature.
        imageFallbackRef.current = null;
        pointsRef.current = pointsRef.current.length ? pointsRef.current : [];

        const canvas = canvasRef.current;
        if (canvas) canvas.setPointerCapture(e.pointerId);

        const p = getPointFromPointerEvent(e);
        pointsRef.current.push({ ...p, move: true });

        setIsDrawing(true);
    };

    const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Use coalesced events when available (much smoother on touch/pen)
        // https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/getCoalescedEvents
        const events: Array<{ clientX: number; clientY: number }> =
            typeof (e as any).getCoalescedEvents === 'function'
                ? (e as any).getCoalescedEvents()
                : [e];

        for (const ev of events) {
            const rect = canvas.getBoundingClientRect();
            const p = {
                x: ev.clientX - rect.left,
                y: ev.clientY - rect.top,
            };
            const prev = pointsRef.current[pointsRef.current.length - 1];

            // Draw immediately (we are already in CSS pixel space).
            ctx.beginPath();
            ctx.moveTo(prev?.x ?? p.x, prev?.y ?? p.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();

            pointsRef.current.push({ ...p, move: false });
        }
    };

    const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        setIsDrawing(false);

        const canvas = canvasRef.current;
        if (canvas) {
            try {
                canvas.releasePointerCapture(e.pointerId);
            } catch {
                // ignore
            }
        }

        finishAndSave();
    };

    const onPointerCancel = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        finishAndSave();
    };

    const clear = () => {
        pointsRef.current = [];
        imageFallbackRef.current = null;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const dpr = dprRef.current || (window.devicePixelRatio || 1);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, rect.width, rect.height);

        onSave(null);
        setHasSignature(false);
    };

    return (
        <div className="space-y-2">
            <div className="relative border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white overflow-hidden h-40">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full cursor-crosshair"
                    style={{ touchAction: 'none' }}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerCancel}
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
