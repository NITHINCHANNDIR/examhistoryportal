import React from 'react';

/**
 * Modern Premium Skeleton Loading Components
 *Indigo theme with smooth animations and rounded corners
 */

export const SkeletonText = ({ width = '100%', height = '16px', className = '', style = {} }) => (
    <div
        className={`skeleton ${className}`}
        style={{ width, height, borderRadius: '6px', ...style }}
    />
);

export const SkeletonCircle = ({ size = '48px', className = '' }) => (
    <div
        className={`skeleton ${className}`}
        style={{ width: size, height: size, borderRadius: '16px' }}
    />
);

export const SkeletonCard = ({ className = '' }) => (
    <div className={`card ${className}`} style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <SkeletonCircle size="56px" />
            <div style={{ flex: 1 }}>
                <SkeletonText width="60%" height="18px" />
                <SkeletonText width="40%" height="14px" style={{ marginTop: '8px' }} />
            </div>
        </div>
        <SkeletonText width="100%" height="14px" />
        <SkeletonText width="80%" height="14px" style={{ marginTop: '12px' }} />
        <SkeletonText width="90%" height="14px" style={{ marginTop: '12px' }} />
    </div>
);

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
    <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
        {/* Header */}
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: '16px',
                padding: '20px 24px',
                backgroundColor: 'var(--color-surface)'
            }}
        >
            {Array.from({ length: cols }).map((_, i) => (
                <SkeletonText key={i} width="70%" height="16px" />
            ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
                key={rowIndex}
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gap: '16px',
                    padding: '20px 24px',
                    backgroundColor: 'var(--color-card-bg, white)',
                    borderBottom: rowIndex === rows - 1 ? 'none' : '1px solid var(--color-border)'
                }}
            >
                {Array.from({ length: cols }).map((_, colIndex) => (
                    <SkeletonText
                        key={colIndex}
                        width={colIndex === 0 ? '100%' : `${60 + Math.random() * 30}%`}
                        height="16px"
                    />
                ))}
            </div>
        ))}
    </div>
);

export const SkeletonChart = ({ height = '300px' }) => (
    <div
        className="skeleton"
        style={{
            width: '100%',
            height,
            borderRadius: '16px'
        }}
    />
);

export const SkeletonStats = ({ count = 4 }) => (
    <div
        style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${count}, 1fr)`,
            gap: '20px'
        }}
    >
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="card" style={{ padding: '24px' }}>
                <SkeletonText width="40%" height="14px" />
                <SkeletonText width="70%" height="36px" style={{ marginTop: '12px' }} />
                <SkeletonText width="50%" height="14px" style={{ marginTop: '12px' }} />
            </div>
        ))}
    </div>
);

export default {
    SkeletonText,
    SkeletonCircle,
    SkeletonCard,
    SkeletonTable,
    SkeletonChart,
    SkeletonStats
};
