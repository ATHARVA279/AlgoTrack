import { memo } from 'react';
import { ClipLoader } from 'react-spinners';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner = memo<LoadingSpinnerProps>(({ 
  size = 'md', 
  text = 'Loading...' 
}) => {
  const sizeMap = {
    sm: 30,
    md: 50,
    lg: 70
  };

  return (
    <div className="flex items-center justify-center text-white">
      <div className="text-center">
        <ClipLoader 
          color="#B026FF" 
          size={sizeMap[size]}
          cssOverride={{ margin: '0 auto', marginBottom: '1rem' }}
        />
        <p className="text-gray-300">{text}</p>
      </div>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';