import { CheckCircleIcon, ClockIcon, MapPinIcon, StarIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';

interface AttractionCardProps {
  id: number;
  name: string;
  description: string;
  images: string[];
  distance: string;
  travel_time: string;
  type: string;
  highlights: string[];
  best_time: string;
  category: string;
  onImageClick?: () => void;
  getCategoryColor?: (category: string) => string;
}

const AttractionCard: React.FC<AttractionCardProps> = ({
  id,
  name,
  description,
  images,
  distance,
  travel_time,
  type,
  highlights,
  best_time,
  category,
  onImageClick,
  getCategoryColor
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if description is long enough to need truncation
  const needsTruncation = description.length > 150;
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const defaultGetCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      beach: 'bg-blue-100 text-blue-800',
      fort: 'bg-red-100 text-red-800',
      temple: 'bg-yellow-100 text-yellow-800',
      market: 'bg-green-100 text-green-800',
      viewpoint: 'bg-purple-100 text-purple-800',
      museum: 'bg-indigo-100 text-indigo-800',
      park: 'bg-emerald-100 text-emerald-800',
      agriculture: 'bg-green-100 text-green-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const categoryColor = getCategoryColor ? getCategoryColor(category) : defaultGetCategoryColor(category);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Image */}
      <div className="relative h-48 sm:h-56">
        <img
          src={images[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
          alt={name}
          className="w-full h-full object-cover cursor-pointer"
          onClick={onImageClick}
        />
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColor}`}>
            {type}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
          <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
          <span className="text-sm font-medium">4.5</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
        
        {/* Description with expandable functionality */}
        <div className="mb-4">
          <p className={`text-gray-600 text-sm ${!isExpanded ? 'line-clamp-3' : ''}`}>
            {description}
          </p>
          {needsTruncation && (
            <button
              onClick={toggleExpanded}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline mt-1 transition-colors"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Details */}
        <div className="mb-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-500">
              <MapPinIcon className="h-4 w-4 mr-2" />
              {distance}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <ClockIcon className="h-4 w-4 mr-2" />
              {travel_time} drive
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Best time: {best_time}
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Highlights:</h4>
          <div className="flex flex-wrap gap-1">
            {highlights.map((highlight, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onImageClick}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          View Gallery
        </button>
      </div>
    </div>
  );
};

export default AttractionCard; 
