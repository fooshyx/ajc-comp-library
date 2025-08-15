export const resizeImage = (file: File, targetWidth: number, targetHeight: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = targetWidth
      canvas.height = targetHeight

      if (ctx) {
        // Clear the canvas
        ctx.clearRect(0, 0, targetWidth, targetHeight)
        
        // Draw the image scaled to fit the canvas
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
        
        // Convert to base64
        const resizedDataUrl = canvas.toDataURL('image/png')
        resolve(resizedDataUrl)
      } else {
        reject(new Error('Could not get canvas context'))
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    // Create object URL from file and set as image source
    const objectUrl = URL.createObjectURL(file)
    img.src = objectUrl
  })
}

export const processUnitImage = (file: File): Promise<string> => {
  return resizeImage(file, 128, 128)
}

export const processTraitImage = (file: File): Promise<string> => {
  return resizeImage(file, 64, 64)
}

export const processComponentImage = (file: File): Promise<string> => {
  return resizeImage(file, 32, 32)
}

export const processItemImage = (file: File): Promise<string> => {
  return resizeImage(file, 64, 64)
}

export const validateImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    return false
  }

  if (file.size > maxSize) {
    return false
  }

  return true
}