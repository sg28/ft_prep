import React from 'react';
import { Megaphone } from 'lucide-react';

interface AdCardProps {
  title: string;
  description: string;
  ctaText: string;
  sponsor?: string;
  imageUrl?: string;
}

const AdCard: React.FC<AdCardProps> = ({
  title,
  description,
  ctaText,
  sponsor = 'Sponsored',
  imageUrl
}) => {
  return (
    <div className="bg-background-secondary rounded-xl border border-border overflow-hidden transition-colors hover:bg-background-tertiary/30 cursor-pointer">
      {imageUrl ? (
        <div className="w-full h-32 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-32 bg-gradient-to-r from-twitter-blue/20 to-twitter-pink/20 flex items-center justify-center">
          <div className="text-center">
            <span className="text-text-primary">
              <Megaphone size={32} />
            </span>
            <p className="text-text-tertiary text-xs mt-1">Advertisement</p>
          </div>
        </div>
      )}
      
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-text-tertiary text-xs font-medium">{sponsor}</span>
          <button className="text-text-tertiary text-xs hover:text-text-secondary">
            ···
          </button>
        </div>
        
        <h3 className="font-bold text-text-primary text-sm mb-1">{title}</h3>
        <p className="text-text-tertiary text-xs mb-3">{description}</p>
        
        <button className="w-full bg-twitter-blue text-white rounded-lg py-2 text-sm font-bold hover:bg-twitter-blueHover transition-colors">
          {ctaText}
        </button>
      </div>
    </div>
  );
};

export default AdCard;
