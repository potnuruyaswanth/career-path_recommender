/**
 * Scroll-triggered animations utility
 * Adds animation classes when elements enter viewport
 */

export function initScrollAnimations() {
  // Create intersection observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Add animation class
        entry.target.classList.add('animate-in-view');
        
        // Apply staggered animation for multiple children
        const children = entry.target.querySelectorAll('[data-animate]');
        children.forEach((child, index) => {
          child.style.animation = `cardStagger 0.6s ease-out ${index * 0.1}s backwards`;
        });
        
        // Stop observing after animation triggers
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all elements with data-scroll-animate attribute
  document.querySelectorAll('[data-scroll-animate]').forEach((el) => {
    observer.observe(el);
  });

  return observer;
}

export function observeElement(element) {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in-view');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  if (element) {
    observer.observe(element);
  }

  return observer;
}

export function cleanup(observer) {
  if (observer) {
    observer.disconnect();
  }
}
