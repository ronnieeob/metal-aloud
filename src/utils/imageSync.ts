export function syncBackgroundImage(imageUrl: string) {
  // Validate URL
  try {
    new URL(imageUrl);
  } catch {
    console.error('Invalid image URL:', imageUrl);
    return;
  }

  // Store background image URL
  localStorage.setItem('metal_aloud_background_image', imageUrl);
  
  // Update body background
  const img = new Image();
  img.onload = () => {
    document.body.style.background = `linear-gradient(to bottom right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), url('${imageUrl}') no-repeat center center fixed`;
    document.body.style.backgroundSize = 'cover';
  };
  img.onerror = () => {
    console.error('Failed to load background image:', imageUrl);
    // Fallback to default image
    document.body.style.background = `linear-gradient(to bottom right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), url('https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3') no-repeat center center fixed`;
    document.body.style.backgroundSize = 'cover';
  };
  img.src = imageUrl;
}

export function initializeBackground() {
  const backgroundImage = localStorage.getItem('metal_aloud_background_image') || 
    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3';
  syncBackgroundImage(backgroundImage);
}

export function syncProfileAndLogo(imageUrl: string | File) {
  if (!imageUrl) return;

  // Convert File to base64 if needed
  if (imageUrl instanceof File) {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        saveAndUpdateImages(reader.result);
      }
    };
    reader.readAsDataURL(imageUrl);
    return;
  }

  saveAndUpdateImages(imageUrl);
}

function saveAndUpdateImages(imageUrl: string | File) {
  // Store both profile image and website logo
  localStorage.setItem('metal_aloud_website_image', imageUrl);
  
  // Store admin profile image separately
  const user = JSON.parse(localStorage.getItem('metal_aloud_user') || '{}');
  if (user.role === 'admin') {
    localStorage.setItem('metal_aloud_profile_image_admin', imageUrl);
  }
  
  // Update any logo images in the DOM
  const logos = document.querySelectorAll('img[alt="Metal Aloud"]');
  logos.forEach(logo => {
    if (logo instanceof HTMLImageElement) {
      logo.src = imageUrl;
    }
  });

  // Update any admin profile images
  const profileImages = document.querySelectorAll('img[alt="Admin Profile"]');
  profileImages.forEach(img => {
    if (img instanceof HTMLImageElement) {
      img.src = imageUrl;
    }
  });
}

export function getWebsiteLogo(): string {
  return localStorage.getItem('metal_aloud_website_image') || 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c';
}