export const processSVGFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const svgContent = e.target?.result as string
      
      // Basic SVG validation
      if (!svgContent.includes('<svg') || !svgContent.includes('</svg>')) {
        reject(new Error('Invalid SVG file'))
        return
      }
      
      // Clean up the SVG and ensure proper dimensions
      const cleanedSVG = cleanupSVG(svgContent, 64, 64)
      resolve(cleanedSVG)
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read SVG file'))
    }
    
    reader.readAsText(file)
  })
}

const cleanupSVG = (svgContent: string, width: number, height: number): string => {
  // Parse the SVG to ensure it has proper dimensions
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgContent, 'image/svg+xml')
  const svgElement = doc.querySelector('svg')
  
  if (!svgElement) {
    throw new Error('Invalid SVG structure')
  }
  
  // Get original viewBox or create one from width/height
  let viewBox = svgElement.getAttribute('viewBox')
  if (!viewBox) {
    const originalWidth = svgElement.getAttribute('width') || width.toString()
    const originalHeight = svgElement.getAttribute('height') || height.toString()
    // Remove units and get numeric values
    const w = parseFloat(originalWidth.toString().replace(/[^\d.]/g, '')) || width
    const h = parseFloat(originalHeight.toString().replace(/[^\d.]/g, '')) || height
    viewBox = `0 0 ${w} ${h}`
  }
  
  // Set consistent dimensions while preserving original viewBox
  svgElement.setAttribute('width', width.toString())
  svgElement.setAttribute('height', height.toString())
  svgElement.setAttribute('viewBox', viewBox)
  
  // Ensure the SVG doesn't have any scripts (security)
  const scripts = svgElement.querySelectorAll('script')
  scripts.forEach(script => script.remove())
  
  // Set default black color for all elements that don't have explicit colors
  const allElements = svgElement.querySelectorAll('*')
  allElements.forEach(element => {
    // Only set color if no fill or stroke is specified
    if (!element.getAttribute('fill') && !element.getAttribute('stroke')) {
      element.setAttribute('fill', 'black')
    }
    // If fill is set to 'currentColor' or similar, change to black
    const fill = element.getAttribute('fill')
    if (fill === 'currentColor' || fill === 'inherit') {
      element.setAttribute('fill', 'black')
    }
    const stroke = element.getAttribute('stroke')
    if (stroke === 'currentColor' || stroke === 'inherit') {
      element.setAttribute('stroke', 'black')
    }
  })
  
  // Set default fill on the root SVG if no default is set
  if (!svgElement.getAttribute('fill')) {
    svgElement.setAttribute('fill', 'black')
  }
  
  // Return the cleaned SVG as string
  return new XMLSerializer().serializeToString(svgElement)
}

export const validateSVGFile = (file: File): boolean => {
  const allowedTypes = ['image/svg+xml']
  const maxSize = 1 * 1024 * 1024 // 1MB for SVG files
  
  if (!allowedTypes.includes(file.type)) {
    return false
  }
  
  if (file.size > maxSize) {
    return false
  }
  
  return true
}

export const createSVGDataURL = (svgContent: string): string => {
  const blob = new Blob([svgContent], { type: 'image/svg+xml' })
  return URL.createObjectURL(blob)
}