import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = true, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-2xl p-6 ${
        hover ? 'glass-panel-hover' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
