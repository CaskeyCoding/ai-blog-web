import { API_CONFIG } from '../config';
import { fetchAuthSession } from 'aws-amplify/auth';

const API_URL = API_CONFIG.API_URL;

// Helper function to get authenticated headers
async function getAuthHeaders(): Promise<HeadersInit> {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  } catch (_) {
    throw new Error('Authentication required');
  }
}

export async function triggerAgentRevision(postId: string): Promise<any> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/agent/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ 
      type: 'blog_revision',
      postId 
    }),
  });
  if (!res.ok) throw new Error('Failed to trigger agent revision');
  return res.json();
}

export async function generateBlogPost(prompt: string, tags: string[] = [], imageUrl?: string): Promise<any> {
  const headers = await getAuthHeaders();
  const requestBody: any = { 
    type: 'blog_generation',
    prompt,
    tags
  };
  
  if (imageUrl) {
    requestBody.imageUrl = imageUrl;
  }
  
  const res = await fetch(`${API_URL}/agent/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });
  if (!res.ok) throw new Error('Failed to generate blog post');
  return res.json();
}

export async function getAgentStatus(taskId: string): Promise<any> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/agent/status/${taskId}`, {
    headers
  });
  if (!res.ok) throw new Error('Failed to get agent status');
  return res.json();
}

export async function scheduleBlogPost(postId: string, scheduledAt: string): Promise<any> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/agent/schedule`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ postId, scheduledAt }),
  });
  if (!res.ok) throw new Error('Failed to schedule blog post');
  return res.json();
}

export async function approveAgentTask(taskId: string): Promise<any> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/agent/approve/${taskId}`, {
    method: 'POST',
    headers,
  });
  if (!res.ok) throw new Error('Failed to approve agent task');
  return res.json();
}

export async function rejectAgentTask(taskId: string, reason?: string): Promise<any> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/agent/reject/${taskId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ reason: reason || '' }),
  });
  if (!res.ok) throw new Error('Failed to reject agent task');
  return res.json();
} 