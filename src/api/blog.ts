import { API_CONFIG } from '../config';

const API_URL = API_CONFIG.API_URL;

export interface BlogPost {
  postId: string;
  title: string;
  content: string;
  tags?: string[];
  status?: string;
  scheduledAt?: string;
  [key: string]: any;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const res = await fetch(`${API_URL}/blog`);
  if (!res.ok) {
    throw new Error(`Failed to fetch blog posts: ${res.statusText}`);
  }
  return res.json();
}

export async function getBlogPost(postId: string): Promise<BlogPost> {
  const res = await fetch(`${API_URL}/blog/${postId}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch blog post: ${res.statusText}`);
  }
  return res.json();
}

export async function createBlogPost(post: Partial<BlogPost>): Promise<BlogPost> {
  const res = await fetch(`${API_URL}/blog`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  });
  if (!res.ok) throw new Error('Failed to create blog post');
  return res.json();
}

export async function updateBlogPost(postId: string, post: Partial<BlogPost>): Promise<BlogPost> {
  const res = await fetch(`${API_URL}/blog/${postId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  });
  if (!res.ok) throw new Error('Failed to update blog post');
  return res.json();
}

export async function deleteBlogPost(postId: string): Promise<void> {
  const res = await fetch(`${API_URL}/blog/${postId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete blog post');
} 