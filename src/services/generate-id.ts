/**
 * Generate a random UUID for a note.
 */
export function generateRandomId(): string {
    // Generate a random UUID using the current timestamp and random values
    const timestamp = Date.now().toString(36); // Convert timestamp to base-36 string
    const randomPart = Math.random().toString(36).substring(2, 15); // Generate a random string
    return `${timestamp}-${randomPart}`; // Combine both parts to form a unique ID
}