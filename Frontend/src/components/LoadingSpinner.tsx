import { memo } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner = memo<LoadingSpinnerProps>(({ 
  size = 'md', 
  text = 'Loading...' 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className="flex items-center justify-center text-white">
      <div className="text-center">
        <div 
          className={`animate-spin rounded-full border-b-2 border-neon-purple mx-auto mb-4 ${sizeClasses[size]}`}
        />
        <p className="text-gray-300">{text}</p>
      </div>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';