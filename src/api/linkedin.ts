import { API_CONFIG } from '../config';

const API_URL = API_CONFIG.API_URL;

export async function generateLinkedInPost(postId: string): Promise<any> {
  const res = await fetch(`${API_URL}/linkedin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ postId }),
  });
  if (!res.ok) throw new Error('Failed to generate LinkedIn post');
  return res.json();
} 