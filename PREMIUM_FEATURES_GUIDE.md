# Premium Features Guide

This guide explains how to use all the premium animation and UI features that have been added to the Grand Valley Resort website.

## 🎯 Installed Libraries

- **GSAP** - Advanced animations and ScrollTrigger
- **Framer Motion** - React animations
- **Lenis** - Smooth scrolling
- **AOS** - Scroll animations (available)
- **Split-Type** - Text splitting for animations

## 📦 Components

### 1. SmoothScroll
Wraps your app for smooth scrolling experience.

```tsx
import SmoothScroll from './components/SmoothScroll'

<SmoothScroll>
  <YourApp />
</SmoothScroll>
```

### 2. PremiumButton
Buttons with magnetic hover effects and multiple variants.

```tsx
import PremiumButton from './components/PremiumButton'

<PremiumButton variant="primary" magnetic>
  Book Now
</PremiumButton>

<PremiumButton variant="ghost">
  Learn More
</PremiumButton>

<PremiumButton variant="glass">
  Contact Us
</PremiumButton>
```

**Variants:**
- `primary` - Gradient button (dark blue to golden)
- `ghost` - Outlined button
- `glass` - Glassmorphism effect
- `minimal` - Simple text button
- `gradient` - Golden gradient

### 3. PremiumImage
Images with lazy loading, blur placeholders, and parallax effects.

```tsx
import PremiumImage from './components/PremiumImage'

<PremiumImage
  src="/images/room.jpg"
  alt="Luxury Room"
  className="h-64 w-full"
  parallax
  blur
/>
```

### 4. TextReveal
Animated text reveals on scroll.

```tsx
import TextReveal from './components/TextReveal'

<TextReveal variant="fade" as="h1">
  Welcome to Grand Valley Resort
</TextReveal>

<TextReveal variant="split" as="h2">
  Experience Luxury
</TextReveal>
```

**Variants:**
- `fade` - Fade in with slide
- `slide` - Slide in from left
- `mask` - Mask reveal
- `split` - Word-by-word reveal
- `char` - Character-by-character reveal

### 5. GlassCard
Glassmorphism card component.

```tsx
import GlassCard from './components/GlassCard'

<GlassCard hover>
  <h3>Premium Feature</h3>
  <p>Description here</p>
</GlassCard>
```

### 6. FormField
Premium form inputs with floating labels.

```tsx
import FormField from './components/FormField'

<FormField
  label="Your Name"
  name="name"
  value={formData.name}
  onChange={handleChange}
  required
/>
```

### 7. SkeletonLoader
Loading placeholders.

```tsx
import SkeletonLoader from './components/SkeletonLoader'

<SkeletonLoader variant="rectangular" className="h-64" />
<SkeletonLoader variant="text" />
<SkeletonLoader variant="circular" />
```

### 8. Preloader
Page loading animation (automatically integrated).

## 🎣 Hooks

### useParallax
Parallax scrolling effect.

```tsx
import { useParallax } from './hooks/useParallax'

const parallaxRef = useParallax(0.5) // speed

<div ref={parallaxRef}>
  Content with parallax
</div>
```

### useMagnetic
Magnetic hover effect.

```tsx
import { useMagnetic } from './hooks/useMagnetic'

const magneticRef = useMagnetic(0.3) // strength

<div ref={magneticRef}>
  Magnetic element
</div>
```

## 🎨 CSS Classes

### Premium Spacing
```tsx
<div className="section-padding-premium">
  {/* Large section padding (80-150px) */}
</div>

<div className="container-premium">
  {/* Premium container with max-width */}
</div>
```

### Glass Morphism
```tsx
<div className="glass">
  {/* Light glass effect */}
</div>

<div className="glass-dark">
  {/* Dark glass effect */}
</div>
```

### Premium Cards
```tsx
<div className="premium-card">
  {/* Card with glass effect and hover animations */}
</div>
```

### Text Styles
```tsx
<h1 className="text-premium-heading">
  Large Premium Heading
</h1>

<h2 className="text-premium-subheading">
  Subheading
</h2>

<p className="text-soft-black">
  Soft black text (#111)
</p>
```

### Animations
```tsx
<button className="magnetic-button">
  Magnetic Button
</button>

<div className="card-lift">
  Card with hover lift
</div>

<div className="ripple">
  Ripple effect on click
</div>

<div className="shimmer">
  Shimmer loading effect
</div>
```

## 📐 Layout Best Practices

1. **Large Section Padding**: Use `section-padding-premium` for hero sections
2. **Big Hero Sections**: Minimum 80vh height
3. **Grid Layouts**: Use CSS Grid for premium layouts
4. **White Space**: Generous spacing creates premium feel
5. **Typography**: Use serif for headings, sans-serif for body

## 🎬 Animation Guidelines

1. **Text Reveals**: Use on all major headings
2. **Parallax**: Apply to hero images and backgrounds
3. **Hover Effects**: Add to all interactive elements
4. **Scroll Animations**: Trigger on scroll into view
5. **Micro Animations**: Use for buttons, icons, cards

## 🖼️ Image Optimization

1. Convert images to WebP format
2. Use `PremiumImage` component for lazy loading
3. Add blur placeholders for better UX
4. Use parallax for hero images

## ⚡ Performance Tips

1. Lazy load images below the fold
2. Use skeleton loaders for async content
3. Optimize animations with `will-change` CSS
4. Use `transform` and `opacity` for animations (GPU accelerated)

## 🎯 Example: Premium Hero Section

```tsx
import TextReveal from './components/TextReveal'
import PremiumButton from './components/PremiumButton'
import PremiumImage from './components/PremiumImage'
import { useParallax } from './hooks/useParallax'

function HeroSection() {
  const parallaxRef = useParallax(0.3)

  return (
    <section className="section-padding-premium relative min-h-screen flex items-center">
      <PremiumImage
        src="/images/hero.jpg"
        alt="Resort"
        className="absolute inset-0"
        parallax
        blur
      />
      
      <div className="container-premium relative z-10">
        <TextReveal variant="split" as="h1" className="text-premium-heading text-golden mb-6">
          Welcome to Grand Valley Resort
        </TextReveal>
        
        <TextReveal variant="fade" delay={0.2} className="text-xl text-white/90 mb-8">
          Experience luxury in the heart of nature
        </TextReveal>
        
        <PremiumButton variant="primary" magnetic>
          Book Your Stay
        </PremiumButton>
      </div>
    </section>
  )
}
```

## 🚀 Next Steps

1. Replace existing buttons with `PremiumButton`
2. Add `TextReveal` to all major headings
3. Use `PremiumImage` for all images
4. Add parallax effects to hero sections
5. Implement glass cards for feature sections
6. Add skeleton loaders for loading states
