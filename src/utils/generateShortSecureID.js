export function generateShortSecureID() {
  const charLength = 10;
  // Get 6 random bytes (48 bits of entropy) - sufficient for 10 base64/base36 chars
  const array = new Uint8Array(6); 
  
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for extremely old environments (less secure)
    for (let i = 0; i < 6; i++) {
        array[i] = Math.floor(Math.random() * 256);
    }
  }

  // Convert the array to a hexadecimal string, then take a fixed-length slice
  let hexString = Array.from(array)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  
  // Use the first 10 characters of the hexadecimal string 
  // (20 characters are generated from 10 bytes, but we only generated 6 bytes)
  // Let's rely on a custom mapping or slice the UUID instead for better length control.
  
  // --- Simpler Approach: Generate a UUID and slice/replace ---
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      // 1. Generate a UUID (36 chars with hyphens)
      const uuid = crypto.randomUUID();
      
      // 2. Remove hyphens (32 chars)
      const noHyphens = uuid.replace(/-/g, '');
      
      // 3. Take the first 10 characters and convert to uppercase for consistency
      return noHyphens.substring(0, charLength).toUpperCase();
  }
  
  // --- Fallback if crypto.randomUUID is not available (less secure) ---
  const timestamp = Date.now().toString(36); // Base 36 timestamp
  const randomPart = Math.random().toString(36).substring(2); // Random base 36 part
  
  return (timestamp + randomPart).substring(0, charLength).toUpperCase();
}
