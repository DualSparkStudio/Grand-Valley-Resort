import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  schema?: object;
}

const SEO: React.FC<SEOProps> = ({
  title = "Grand Valley Resort Bhilar - Luxury Resort in Mahabaleshwar | Best Hill Station Stay",
  description = "Experience luxury at Grand Valley Resort Bhilar, Mahabaleshwar. Premium rooms, stunning valley views, modern amenities. Book your perfect hill station getaway near Panchgani. Best rates guaranteed!",
  keywords = "Grand Valley Resort, Bhilar resort, Mahabaleshwar resort, Panchgani hotels, luxury resort Mahabaleshwar, hill station resort, valley view resort, best resort in Mahabaleshwar, Bhilar accommodation, weekend getaway Mahabaleshwar",
  image = "https://grandvalleyresort.com/images/resort-exterior.jpg",
  url = "https://grandvalleyresort.com",
  type = "website",
  schema
}) => {
  // Default LocalBusiness Schema
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": "Grand Valley Resort Bhilar",
    "image": image,
    "description": description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Bhilar Village",
      "addressLocality": "Mahabaleshwar",
      "addressRegion": "Maharashtra",
      "postalCode": "412806",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "17.9244",
      "longitude": "73.6588"
    },
    "url": url,
    "telephone": "+91-XXXXXXXXXX",
    "priceRange": "₹₹₹",
    "starRating": {
      "@type": "Rating",
      "ratingValue": "4.5"
    },
    "amenityFeature": [
      {
        "@type": "LocationFeatureSpecification",
        "name": "Free WiFi",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Free Parking",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Restaurant",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Valley View",
        "value": true
      }
    ],
    "checkinTime": "12:00",
    "checkoutTime": "10:00"
  };

  const schemaData = schema || defaultSchema;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Grand Valley Resort Bhilar" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Grand Valley Resort Bhilar" />
      <meta property="og:locale" content="en_IN" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@grandvalleyresort" />
      
      {/* Additional SEO Tags */}
      <meta name="geo.region" content="IN-MH" />
      <meta name="geo.placename" content="Mahabaleshwar" />
      <meta name="geo.position" content="17.9244;73.6588" />
      <meta name="ICBM" content="17.9244, 73.6588" />
      
      {/* Canonical */}
      <link rel="canonical" href={url} />
      
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(schemaData)}
      </script>
    </Helmet>
  );
};

export default SEO;
