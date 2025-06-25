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
  try {
    const res = await fetch(`${API_URL}/blog`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Blog fetch error:', {
        status: res.status,
        statusText: res.statusText,
        errorData
      });
      throw new Error(`Failed to fetch blog posts: ${res.statusText}`);
    }
    const posts = await res.json();
    console.log('Successfully fetched blog posts:', posts);
    return posts;
  } catch (error) {
    console.error('Error in getBlogPosts:', error);
    throw error;
  }
}

export async function getBlogPost(postId: string): Promise<BlogPost> {
  try {
    const res = await fetch(`${API_URL}/blog/${postId}`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('Blog post fetch error:', {
        postId,
        status: res.status,
        statusText: res.statusText,
        errorData
      });
      throw new Error(`Failed to fetch blog post: ${res.statusText}`);
    }
    const post = await res.json();
    console.log('Successfully fetched blog post:', post);
    return post;
  } catch (error) {
    console.error('Error in getBlogPost:', error);
    throw error;
  }
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