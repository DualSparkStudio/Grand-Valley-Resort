import React, { useEffect, useState } from 'react'
import { StarIcon, PlusIcon, UserIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/supabase'
import toast from 'react-hot-toast'

interface Review {
  id: number
  guest_name: string
  rating: number
  comment: string
  is_featured: boolean
  is_active: boolean
  created_at: string
  location?: string
}

interface ReviewFormData {
  rating: number
  comment: string
  guest_name: string
  location: string
}

const ReviewsSection: React.FC = () => {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 5,
    comment: '',
    guest_name: user ? `${user.first_name} ${user.last_name}` : '',
    location: ''
  })

  useEffect(() => {
    loadReviews()
  }, [])

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        guest_name: `${user.first_name} ${user.last_name}`
      }))
    }
  }, [user])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const data = await api.getTestimonials()
      setReviews(data)
    } catch (error) {
      toast.error('Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.comment.trim()) {
      toast.error('Please write a review comment')
      return
    }

    if (!formData.guest_name.trim()) {
      toast.error('Please enter your name')
      return
    }

    try {
      setSubmitting(true)
      
      // Submit review to testimonials table
      await api.createTestimonial({
        guest_name: formData.guest_name,
        rating: formData.rating,
        comment: formData.comment,
        is_featured: false,
        is_active: true
      })

      toast.success('Thank you for your review! It will be visible once approved.')
      
      // Reset form
      setFormData({
        rating: 5,
        comment: '',
        guest_name: user ? `${user.first_name} ${user.last_name}` : '',
        location: ''
      })
      setShowForm(false)
      
      // Reload reviews
      loadReviews()
    } catch (error) {
      toast.error('Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = (rating: number, interactive = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive && onRate ? () => onRate(star) : undefined}
            className={interactive ? "cursor-pointer" : "cursor-default"}
          >
            {star <= rating ? (
              <StarIconSolid className="w-5 h-5 text-yellow-400" />
            ) : (
              <StarIcon className="w-5 h-5 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-cream-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-forest mb-4">
            Guest Reviews
          </h2>
          <p className="text-lg sm:text-xl text-sage max-w-3xl mx-auto mb-8">
            Read testimonials from our satisfied guests who experienced luxury at its finest
          </p>
          
          {/* Add Review Button */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary inline-flex items-center justify-center px-6 py-3 text-base"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Share Your Experience
          </button>
        </div>

        {/* Review Form */}
        {showForm && (
          <div className="max-w-2xl mx-auto mb-12 bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Write a Review</h3>
            
            <form onSubmit={handleSubmitReview} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={formData.guest_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, guest_name: e.target.value }))}
                  className="input-field"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., Mumbai, India"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                {renderStars(formData.rating, true, (rating) => 
                  setFormData(prev => ({ ...prev, rating }))
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Review
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                  className="input-field"
                  rows={4}
                  placeholder="Share your experience at Resort Booking System..."
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="testimonial-card animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-5/6 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-gray-300 rounded w-24"></div>
                  <div className="h-4 bg-gray-300 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600">Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {reviews.slice(0, 6).map((review, index) => (
              <div 
                key={review.id} 
                className="testimonial-card animate-scale-in group hover:shadow-xl transition-shadow duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  {renderStars(review.rating)}
                  {review.is_featured && (
                    <span className="bg-forest-800 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Featured
                    </span>
                  )}
                </div>
                
                <blockquote className="text-gray-700 mb-4 text-sm sm:text-base leading-relaxed">
                  "{review.comment}"
                </blockquote>
                
                <div className="flex items-center justify-between">
                  <div>
                    <cite className="font-semibold text-forest not-italic">
                      {review.guest_name}
                    </cite>
                    {review.location && (
                      <p className="text-xs text-gray-500 mt-1">{review.location}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* External Reviews Section */}
        <div className="mt-16 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-forest mb-8">
            See What Others Say About Us
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
            <a
              href="https://www.google.com/travel/search?q=River%20Breeze%20Homestay%20reviews&g2lb=4965990%2C4969803%2C72277293%2C72302247%2C72317059%2C72414906%2C72471280%2C72472051%2C72485658%2C72560029%2C72573224%2C72616120%2C72647020%2C72648289%2C72686036%2C72760082%2C72803964%2C72832976%2C72882230%2C72958594%2C72958624%2C72959983%2C72990341%2C73006382%2C73010541%2C73016492%2C73034801&hl=en-IN&gl=in&cs=1&ssta=1&ts=CAEaRwopEicyJTB4M2JlYTBkODAxZTdjOGMwMzoweGU3NDI5YTBiZWZlYWRmZDQSGhIUCgcI6Q8QBxgQEgcI6Q8QBxgRGAEyAhAA&qs=CAEyFENnc0kxTC1yXzc3QnBxSG5BUkFCOAJCCQnU3-rvC5pC50IJCdTf6u8LmkLn&ap=ugEHcmV2aWV3cw&ictx=111&ved=0CAAQ5JsGahcKEwiI2e68jcGOAxUAAAAAHQAAAAAQBw"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-transparent hover:border-blue-500"
            >
              <div className="flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Google Reviews</h4>
              <div className="flex items-center justify-center mb-2">
                {renderStars(5)}
                <span className="ml-2 text-sm text-gray-600">4.8/5</span>
              </div>
              <p className="text-sm text-gray-600">Read 150+ guest reviews</p>
            </a>

            <a
              href="https://www.airbnb.co.in/rooms/862832331363200128/reviews?source_impression_id=p3_1752592428_P3zxAqmOKTAHQor_"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-transparent hover:border-pink-500"
            >
              <div className="flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-pink-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm6.8 16.2c-.8 1.4-2.4 2.3-4.1 2.3-1.7 0-3.3-.9-4.1-2.3-.4-.7-.6-1.5-.6-2.3 0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5c0 .8-.2 1.6-.6 2.3-.6 1.1-1.6 1.9-2.8 2.2v1.4c0 .3-.2.5-.5.5s-.5-.2-.5-.5v-1.4c-1.2-.3-2.2-1.1-2.8-2.2-.4-.7-.6-1.5-.6-2.3 0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5c0 .8-.2 1.6-.6 2.3zm-6.8-8.7c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5z"/>
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Airbnb Reviews</h4>
              <div className="flex items-center justify-center mb-2">
                {renderStars(5)}
                <span className="ml-2 text-sm text-gray-600">4.9/5</span>
              </div>
              <p className="text-sm text-gray-600">Check our Airbnb listing</p>
            </a>
          </div>
        </div>

        {reviews.length > 6 && (
          <div className="text-center mt-8">
            <button className="btn-secondary">
              Load More Reviews
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReviewsSection 
