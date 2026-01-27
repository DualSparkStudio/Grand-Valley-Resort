import { XMarkIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AttractionCard from '../components/AttractionCard';
import { supabase } from '../lib/supabase';

interface Attraction {
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
  created_at: string;
  updated_at: string;
}

const TouristAttractions: React.FC = () => {

  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery modal state
  const [galleryModal, setGalleryModal] = useState<{
    isOpen: boolean
    images: string[]
    title: string
    currentIndex: number
  }>({
    isOpen: false,
    images: [],
    title: '',
    currentIndex: 0
  })



  // Fetch attractions from database
  useEffect(() => {
    fetchAttractions();
  }, []);

  const fetchAttractions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('attractions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Use demo data if API fails
        // NOTE: These are placeholder images. Please replace with actual photos of each attraction
        // You can upload real images via the Admin panel or replace these URLs with actual image URLs
        setAttractions([
          {
            id: 1,
            name: 'Pratapgad Fort',
            description: 'Historic fort built by Chhatrapati Shivaji Maharaj, offering panoramic views of the Sahyadri mountains. A significant historical landmark with stunning architecture and rich Maratha history.',
            images: [
              'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&q=fort+india',
              'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&q=ancient+fort',
              'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&q=historic+fortress',
              'https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&q=mountain+fort'
            ],
            distance: '24 km from resort',
            travel_time: '45 minutes',
            type: 'Historic Fort',
            highlights: ['Historic', 'Panoramic Views', 'Architecture', 'Photography', 'Cultural Heritage'],
            best_time: 'October to March',
            category: 'fort',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 2,
            name: 'Venna Lake',
            description: 'Beautiful man-made lake perfect for boating and enjoying scenic views. Surrounded by lush greenery and offering various recreational activities including horse riding and toy train rides.',
            images: [
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&q=lake+boating',
              'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&q=mountain+lake',
              'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&q=serene+lake',
              'https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&q=lake+scenery'
            ],
            distance: '12 km from resort',
            travel_time: '25 minutes',
            type: 'Lake',
            highlights: ['Boating', 'Scenic Views', 'Recreation', 'Photography', 'Family Fun'],
            best_time: 'Year Round',
            category: 'viewpoint',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 3,
            name: 'Mapro Garden',
            description: 'Famous strawberry garden and food park offering delicious local treats, fresh strawberries, and beautiful garden views. Perfect for families and food lovers with various food stalls and shopping options.',
            images: [
              'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&q=strawberry+garden',
              'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&q=garden+strawberries',
              'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&q=food+garden',
              'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80&q=strawberry+field'
            ],
            distance: '8 km from resort',
            travel_time: '15 minutes',
            type: 'Garden & Food Park',
            highlights: ['Strawberries', 'Local Food', 'Garden Views', 'Family Fun', 'Shopping'],
            best_time: 'October to May',
            category: 'park',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 4,
            name: 'Lingmala Waterfall',
            description: 'Stunning waterfall cascading down from a height of 600 feet, creating a mesmerizing natural spectacle. Surrounded by dense forests, it offers a perfect spot for nature photography and relaxation.',
            images: [
              'https://images.unsplash.com/photo-1509316785289-025f5b846b35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ],
            distance: '18 km from resort',
            travel_time: '35 minutes',
            type: 'Waterfall',
            highlights: ['Natural Beauty', 'Photography', 'Trekking', 'Scenic Views', 'Nature Walk'],
            best_time: 'July to September',
            category: 'viewpoint',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 5,
            name: 'Elephant\'s Head Point',
            description: 'Famous viewpoint shaped like an elephant\'s head and trunk, offering breathtaking views of the Sahyadri ranges. One of the most popular sunrise and sunset viewing spots in Mahabaleshwar.',
            images: [
              'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ],
            distance: '10 km from resort',
            travel_time: '20 minutes',
            type: 'Viewpoint',
            highlights: ['Sunrise', 'Sunset', 'Panoramic Views', 'Photography', 'Nature'],
            best_time: 'October to May',
            category: 'viewpoint',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 6,
            name: 'Kate\'s Point',
            description: 'Scenic viewpoint offering spectacular views of the Krishna Valley and Dhom Dam. Named after a British officer\'s daughter, it provides one of the best panoramic views in the region.',
            images: [
              'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ],
            distance: '11 km from resort',
            travel_time: '22 minutes',
            type: 'Viewpoint',
            highlights: ['Valley Views', 'Photography', 'Sunset', 'Nature', 'Scenic Beauty'],
            best_time: 'Year Round',
            category: 'viewpoint',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 7,
            name: 'Arthur\'s Seat',
            description: 'One of the highest points in Mahabaleshwar, offering stunning views of the Savitri and Koyna valleys. Named after Sir Arthur Malet, it\'s perfect for sunrise viewing and photography.',
            images: [
              'https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ],
            distance: '13 km from resort',
            travel_time: '28 minutes',
            type: 'Viewpoint',
            highlights: ['Sunrise', 'Valley Views', 'Photography', 'Nature', 'Trekking'],
            best_time: 'October to May',
            category: 'viewpoint',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 8,
            name: 'Panchgani',
            description: 'Beautiful hill station located at an altitude of 1334 meters, famous for its strawberry farms, scenic viewpoints, and pleasant climate. A perfect day trip destination with multiple attractions.',
            images: [
              'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ],
            distance: '20 km from resort',
            travel_time: '40 minutes',
            type: 'Hill Station',
            highlights: ['Strawberry Farms', 'Viewpoints', 'Shopping', 'Food', 'Nature'],
            best_time: 'Year Round',
            category: 'viewpoint',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 9,
            name: 'Mahabaleshwar Temple',
            description: 'Ancient temple dedicated to Lord Shiva, one of the most sacred places in the region. The temple has a unique architecture and is surrounded by beautiful natural surroundings.',
            images: [
              'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ],
            distance: '14 km from resort',
            travel_time: '30 minutes',
            type: 'Temple',
            highlights: ['Religious', 'Architecture', 'Spiritual', 'Photography', 'Cultural'],
            best_time: 'Year Round',
            category: 'temple',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 10,
            name: 'Connaught Peak',
            description: 'Second highest point in Mahabaleshwar offering panoramic views of the surrounding valleys and hills. Named after the Duke of Connaught, it\'s perfect for sunrise and sunset viewing.',
            images: [
              'https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ],
            distance: '15 km from resort',
            travel_time: '32 minutes',
            type: 'Viewpoint',
            highlights: ['Sunrise', 'Sunset', 'Panoramic Views', 'Photography', 'Trekking'],
            best_time: 'October to May',
            category: 'viewpoint',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 11,
            name: 'Bombay Point',
            description: 'Popular sunset point offering spectacular views of the surrounding valleys. One of the most visited viewpoints in Mahabaleshwar, perfect for evening visits and photography.',
            images: [
              'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ],
            distance: '12 km from resort',
            travel_time: '25 minutes',
            type: 'Sunset Point',
            highlights: ['Sunset', 'Photography', 'Valley Views', 'Nature', 'Scenic Beauty'],
            best_time: 'Year Round',
            category: 'viewpoint',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 12,
            name: 'Wilson Point',
            description: 'Highest point in Mahabaleshwar, also known as Sunrise Point. Offers breathtaking 360-degree views of the surrounding landscape and is perfect for early morning visits.',
            images: [
              'https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ],
            distance: '16 km from resort',
            travel_time: '35 minutes',
            type: 'Sunrise Point',
            highlights: ['Sunrise', '360° Views', 'Photography', 'Nature', 'Trekking'],
            best_time: 'October to May',
            category: 'viewpoint',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 13,
            name: 'Table Land',
            description: 'Largest volcanic plateau in Asia, located in Panchgani. Offers stunning views and is perfect for horse riding, paragliding, and enjoying the vast open space.',
            images: [
              'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ],
            distance: '22 km from resort',
            travel_time: '45 minutes',
            type: 'Plateau',
            highlights: ['Horse Riding', 'Paragliding', 'Photography', 'Adventure', 'Scenic Views'],
            best_time: 'Year Round',
            category: 'viewpoint',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 14,
            name: 'Rajpuri Caves',
            description: 'Ancient caves with natural water pools believed to have religious significance. The caves are surrounded by beautiful natural scenery and offer a unique spiritual experience.',
            images: [
              'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ],
            distance: '26 km from resort',
            travel_time: '50 minutes',
            type: 'Caves',
            highlights: ['Religious', 'Natural Pools', 'Spiritual', 'Photography', 'Adventure'],
            best_time: 'Year Round',
            category: 'viewpoint',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 15,
            name: 'Tapola (Mini Kashmir)',
            description: 'Beautiful village located near the Koyna Dam, often called Mini Kashmir due to its stunning natural beauty. Offers boating, water sports, and breathtaking views of the backwaters.',
            images: [
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1439066615861-d1af74d74000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ],
            distance: '30 km from resort',
            travel_time: '55 minutes',
            type: 'Village & Lake',
            highlights: ['Boating', 'Water Sports', 'Scenic Views', 'Photography', 'Nature'],
            best_time: 'Year Round',
            category: 'viewpoint',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 16,
            name: 'Chinaman\'s Falls',
            description: 'Beautiful waterfall cascading through dense forests, creating a serene and picturesque setting. Perfect for nature lovers and photography enthusiasts.',
            images: [
              'https://images.unsplash.com/photo-1509316785289-025f5b846b35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ],
            distance: '19 km from resort',
            travel_time: '38 minutes',
            type: 'Waterfall',
            highlights: ['Natural Beauty', 'Photography', 'Trekking', 'Nature Walk', 'Scenic Views'],
            best_time: 'July to September',
            category: 'viewpoint',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 17,
            name: 'Dhobi Waterfall',
            description: 'Picturesque waterfall surrounded by lush greenery, offering a peaceful retreat. The waterfall creates natural pools perfect for a refreshing dip during monsoon season.',
            images: [
              'https://images.unsplash.com/photo-1509316785289-025f5b846b35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1547036967-23d11aacaee0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ],
            distance: '17 km from resort',
            travel_time: '35 minutes',
            type: 'Waterfall',
            highlights: ['Natural Beauty', 'Swimming', 'Photography', 'Nature', 'Monsoon'],
            best_time: 'July to September',
            category: 'viewpoint',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 18,
            name: 'Lodwick Point',
            description: 'Scenic viewpoint named after General Lodwick, offering spectacular views of the Krishna Valley. Features a natural rock formation and is perfect for photography.',
            images: [
              'https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ],
            distance: '13 km from resort',
            travel_time: '28 minutes',
            type: 'Viewpoint',
            highlights: ['Valley Views', 'Photography', 'Rock Formation', 'Nature', 'Scenic Beauty'],
            best_time: 'Year Round',
            category: 'viewpoint',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 19,
            name: 'Needle Hole Point',
            description: 'Unique viewpoint featuring a natural rock formation with a hole, offering stunning views of the surrounding valleys. Also known as Elephant Point due to its shape.',
            images: [
              'https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ],
            distance: '11 km from resort',
            travel_time: '23 minutes',
            type: 'Viewpoint',
            highlights: ['Rock Formation', 'Photography', 'Valley Views', 'Nature', 'Unique'],
            best_time: 'Year Round',
            category: 'viewpoint',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 20,
            name: 'Sunset Point',
            description: 'Popular sunset viewing spot offering breathtaking views as the sun sets over the Sahyadri mountains. Perfect for evening visits and capturing beautiful sunset photographs.',
            images: [
              'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1505142468610-359e7d316be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            ],
            distance: '12 km from resort',
            travel_time: '25 minutes',
            type: 'Sunset Point',
            highlights: ['Sunset', 'Photography', 'Mountain Views', 'Nature', 'Scenic Beauty'],
            best_time: 'Year Round',
            category: 'viewpoint',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
        return;
      }

      setAttractions(data || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Gallery functions
  const openGallery = (images: string[], title: string) => {
    setGalleryModal({
      isOpen: true,
      images,
      title,
      currentIndex: 0
    })
  }

  const closeGallery = () => {
    setGalleryModal({
      isOpen: false,
      images: [],
      title: '',
      currentIndex: 0
    })
  }

  const nextImage = () => {
    setGalleryModal(prev => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length
    }))
  }

  const prevImage = () => {
    setGalleryModal(prev => ({
      ...prev,
      currentIndex: prev.currentIndex === 0 ? prev.images.length - 1 : prev.currentIndex - 1
    }))
  }





  // Keyboard navigation for gallery
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!galleryModal.isOpen) return;
      
      if (e.key === 'Escape') {
        closeGallery();
      } else if (e.key === 'ArrowRight') {
        nextImage();
      } else if (e.key === 'ArrowLeft') {
        prevImage();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [galleryModal.isOpen]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      beach: 'bg-blue-100 text-blue-800',
      fort: 'bg-red-100 text-red-800',
      temple: 'bg-yellow-100 text-yellow-800',
      market: 'bg-green-100 text-green-800',
      viewpoint: 'bg-purple-100 text-purple-800',
      museum: 'bg-indigo-100 text-indigo-800',
      park: 'bg-emerald-100 text-emerald-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-64 sm:h-80 lg:h-96 bg-gradient-to-r from-blue-800 to-green-800">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Tourist Attractions</h1>
            <p className="text-lg sm:text-xl max-w-2xl mx-auto">
              Discover the beautiful places to visit around Grand Valley Resort Bhilar
            </p>
          </div>
        </div>
      </section>

      {/* Attractions Grid */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Explore Mahabaleshwar
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              From scenic viewpoints to historic temples, discover the best attractions in and around Mahabaleshwar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {attractions.map((attraction) => (
              <AttractionCard
                key={attraction.id}
                id={attraction.id}
                name={attraction.name}
                description={attraction.description}
                images={attraction.images}
                distance={attraction.distance}
                travel_time={attraction.travel_time}
                type={attraction.type}
                highlights={attraction.highlights}
                best_time={attraction.best_time}
                category={attraction.category}
                onImageClick={() => openGallery(attraction.images, attraction.name)}
                getCategoryColor={getCategoryColor}
              />
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12 sm:mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Explore?
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Book your stay at Grand Valley Resort Bhilar and experience these amazing attractions firsthand
            </p>
            <Link
              to="/rooms"
              className="inline-block bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold py-4 px-8 rounded-lg hover:from-blue-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Book Your Stay
            </Link>
          </div>
        </div>
      </section>

      {/* Gallery Modal */}
      {galleryModal.isOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            {/* Close Button */}
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>

            {/* Image */}
            <img
              src={galleryModal.images[galleryModal.currentIndex]}
              alt={galleryModal.title}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />

            {/* Navigation */}
            {galleryModal.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                >
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors"
                >
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Title and Counter */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4">
              <h3 className="text-white font-semibold mb-1">{galleryModal.title}</h3>
              <p className="text-white/80 text-sm">
                {galleryModal.currentIndex + 1} of {galleryModal.images.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TouristAttractions; 
