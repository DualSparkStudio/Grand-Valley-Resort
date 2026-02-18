// Cloudinary Configuration
export const CLOUDINARY_CLOUD_NAME = 'dvf39djml'
export const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/`

/**
 * Generate optimized Cloudinary image URL
 * @param publicId - The image path in Cloudinary (e.g., 'Grand Valley Resort/delux room/image1')
 * @param options - Transformation options
 * @returns Optimized image URL
 */
export const getCloudinaryImage = (
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low'
    format?: 'auto' | 'webp' | 'jpg' | 'png'
    crop?: 'fill' | 'fit' | 'scale' | 'crop'
  } = {}
): string => {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill'
  } = options

  const transformations: string[] = []

  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  if (crop && (width || height)) transformations.push(`c_${crop}`)
  transformations.push(`f_${format}`)
  transformations.push(`q_${quality}`)

  const transformString = transformations.join(',')
  
  return `${CLOUDINARY_BASE_URL}${transformString}/${publicId}`
}

/**
 * Get responsive image URLs for different screen sizes
 */
export const getResponsiveImages = (publicId: string) => {
  return {
    mobile: getCloudinaryImage(publicId, { width: 400 }),
    tablet: getCloudinaryImage(publicId, { width: 800 }),
    desktop: getCloudinaryImage(publicId, { width: 1200 }),
    large: getCloudinaryImage(publicId, { width: 1920 })
  }
}

/**
 * Get thumbnail image
 */
export const getThumbnail = (publicId: string, size: number = 300) => {
  return getCloudinaryImage(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    quality: 'auto:good'
  })
}

/**
 * Cloudinary image paths for Grand Valley Resort
 */
export const CLOUDINARY_PATHS = {
  // Room types
  DELUX_ROOM: 'Grand Valley Resort/delux room',
  FAMILY_ROOM: 'Grand Valley Resort/Family room',
  VALLEY_VIEW_ROOM: 'Grand Valley Resort/Valley view room',
  
  // Restaurant
  RESTAURANT: 'Grand Valley Resort/Restaurants',
  
  // You can add more paths as needed
} as const
