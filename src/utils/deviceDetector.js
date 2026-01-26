export const detectDeviceType = () => {
  const ua = navigator.userAgent;
  
  const isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua);
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  if (isTablet) {
    return 'tablet';
  } else if (isMobile) {
    return 'smartphone';
  } else if (hasTouch) {
    return 'laptop';
  } else {
    return 'desktop';
  }
};

export const canUseCamera = () => {
  const deviceType = detectDeviceType();
  return deviceType === 'smartphone' || deviceType === 'tablet';
};

export const getDeviceName = () => {
  const deviceType = detectDeviceType();
  const names = {
    'smartphone': 'Smartphone',
    'tablet': 'Tablet',
    'laptop': 'Laptop',
    'Destop': 'Desktop',
  };
  return names[deviceType] || 'Device';
};

export const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};