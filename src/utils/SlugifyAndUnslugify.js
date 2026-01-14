export function slugify(text) {
    if (!text) return '';
    
    // Transliteration map for common accented characters
    const from = "àáäâãåæçèéëêìíïîñòóöôõøùúüûýÿŕšžțÀÁÄÂÃÅÆÇÈÉËÊÌÍÏÎÑÒÓÖÔÕØÙÚÜÛÝŸŔŠŽȚ";
    const to   = "aaaaaaaceeeeiiiinoooooouuuuyyrsztAAAAAAACEEEEIIIINOOOOOOUUUUYYSZT";

    // 1. Convert to string and trim whitespace
    let slug = String(text).trim();

    // 2. Transliterate common accented characters
    for (let i = 0; i < from.length; i++) {
        slug = slug.replace(new RegExp(from[i], 'g'), to[i]);
    }

    // 3. Process string
    slug = slug
        .toLowerCase()
        // Remove all non-word characters (including special chars) except spaces and hyphens
        .replace(/[^\w\s-]/g, '')
        // Replace spaces and multiple hyphens/underscores with a single dash
        .replace(/[\s_]+/g, '-')
        // Remove leading/trailing dashes
        .replace(/^-+|-+$/g, '');

    return slug;
}

/**
 * Reverts a slug back to a more readable, space-separated string.
 * * This function performs the following steps:
 * 1. Trims leading/trailing whitespace.
 * 2. Replaces all hyphens (-) and underscores (_) with a space.
 * 3. Capitalizes the first letter of the resulting string.
 *
 * @param {string} slug The input slug string.
 * @returns {string} The resulting space-separated string.
 */
export function unslugify(slug) {
    if (!slug) return '';
    
    let text = String(slug).trim()
        // Replace hyphens and underscores with spaces
        .replace(/[-_]/g, ' '); 
    
    // Capitalize the first letter for better readability
    text = text.charAt(0).toUpperCase() + text.slice(1);
    
    return text;
}
