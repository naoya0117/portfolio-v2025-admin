import { useState, useCallback } from 'react';
import { useGraphQL } from './useApi';
import {
  GET_BLOG_POSTS,
  GET_BLOG_POST,
  CREATE_BLOG_POST,
  UPDATE_BLOG_POST,
  DELETE_BLOG_POST,
  PUBLISH_BLOG_POST,
  UNPUBLISH_BLOG_POST,
  GET_MONOLOGUES,
  GET_MONOLOGUE,
  CREATE_MONOLOGUE,
  UPDATE_MONOLOGUE,
  DELETE_MONOLOGUE,
  PUBLISH_MONOLOGUE,
  UNPUBLISH_MONOLOGUE,
  GENERATE_URL_PREVIEW,
} from '@/lib/graphql-queries';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImageUrl?: string;
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Monologue {
  id: string;
  content: string;
  contentType: 'POST' | 'CODE' | 'IMAGE' | 'URL_PREVIEW' | 'BLOG';
  codeLanguage?: string;
  codeSnippet?: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  url?: string;
  urlPreview?: UrlPreview;
  relatedBlogPosts?: string[];
  series?: string;
  category?: string;
  likeCount?: number;
}


export interface UrlPreview {
  title: string;
  description?: string;
  imageUrl?: string;
  siteName?: string;
  url: string;
  favicon?: string;
  createdAt: string;
}

export interface CreateBlogPostInput {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImageUrl?: string;
  tags: string[];
  status?: 'DRAFT' | 'PUBLISHED';
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateBlogPostInput {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImageUrl?: string;
  tags?: string[];
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  seoTitle?: string;
  seoDescription?: string;
}

export interface CreateMonologueInput {
  content: string;
  contentType: 'POST' | 'CODE';
  codeLanguage?: string;
  codeSnippet?: string;
  tags: string[];
  isPublished?: boolean;
  url?: string;
  series?: string;
  category?: string;
}

export interface UpdateMonologueInput {
  content?: string;
  contentType?: 'POST' | 'CODE' | 'IMAGE' | 'URL_PREVIEW' | 'BLOG';
  codeLanguage?: string;
  codeSnippet?: string;
  tags?: string[];
  isPublished?: boolean;
  url?: string;
  series?: string;
  category?: string;
}


export function useBlogManagement() {
  const { executeQuery, data, loading, error } = useGraphQL<unknown>();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  const fetchBlogPosts = useCallback(async () => {
    const result = await executeQuery(GET_BLOG_POSTS) as { adminBlogPosts: BlogPost[] } | null;
    if (result?.adminBlogPosts) {
      setBlogPosts(result.adminBlogPosts);
    }
    return result?.adminBlogPosts;
  }, [executeQuery]);

  const fetchBlogPost = useCallback(async (slug: string) => {
    return await executeQuery(GET_BLOG_POST, { slug });
  }, [executeQuery]);

  const createBlogPost = useCallback(async (input: CreateBlogPostInput) => {
    const result = await executeQuery(CREATE_BLOG_POST, { input }) as { createBlogPost: BlogPost } | null;
    if (result?.createBlogPost) {
      setBlogPosts(prev => [...prev, result.createBlogPost]);
    }
    return result?.createBlogPost;
  }, [executeQuery]);

  const updateBlogPost = useCallback(async (id: string, input: UpdateBlogPostInput) => {
    const result = await executeQuery(UPDATE_BLOG_POST, { id, input }) as { updateBlogPost: BlogPost } | null;
    if (result?.updateBlogPost) {
      setBlogPosts(prev => 
        prev.map(post => post.id === id ? result.updateBlogPost : post)
      );
    }
    return result?.updateBlogPost;
  }, [executeQuery]);

  const deleteBlogPost = useCallback(async (id: string) => {
    const result = await executeQuery(DELETE_BLOG_POST, { id }) as { deleteBlogPost: boolean } | null;
    if (result?.deleteBlogPost) {
      setBlogPosts(prev => prev.filter(post => post.id !== id));
    }
    return result?.deleteBlogPost;
  }, [executeQuery]);

  const publishBlogPost = useCallback(async (id: string) => {
    const result = await executeQuery(PUBLISH_BLOG_POST, { id }) as { publishBlogPost: BlogPost } | null;
    if (result?.publishBlogPost) {
      setBlogPosts(prev => 
        prev.map(post => post.id === id ? result.publishBlogPost : post)
      );
    }
    return result?.publishBlogPost;
  }, [executeQuery]);

  const unpublishBlogPost = useCallback(async (id: string) => {
    const result = await executeQuery(UNPUBLISH_BLOG_POST, { id }) as { unpublishBlogPost: BlogPost } | null;
    if (result?.unpublishBlogPost) {
      setBlogPosts(prev => 
        prev.map(post => post.id === id ? result.unpublishBlogPost : post)
      );
    }
    return result?.unpublishBlogPost;
  }, [executeQuery]);

  return {
    blogPosts,
    loading,
    error,
    fetchBlogPosts,
    fetchBlogPost,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    publishBlogPost,
    unpublishBlogPost,
  };
}

export function useMonologueManagement() {
  const { executeQuery, data, loading, error } = useGraphQL<unknown>();
  const [monologues, setMonologues] = useState<Monologue[]>([]);

  const fetchMonologues = useCallback(async (limit?: number, offset?: number) => {
    const result = await executeQuery(GET_MONOLOGUES, { limit, offset }) as { adminMonologues: Monologue[] } | null;
    if (result?.adminMonologues) {
      setMonologues(result.adminMonologues);
    }
    return result?.adminMonologues;
  }, [executeQuery]);

  const fetchMonologue = useCallback(async (id: string) => {
    return await executeQuery(GET_MONOLOGUE, { id });
  }, [executeQuery]);

  const createMonologue = useCallback(async (input: CreateMonologueInput) => {
    console.log('Creating monologue with input:', input);
    const result = await executeQuery(CREATE_MONOLOGUE, { input }) as { createMonologue: Monologue } | null;
    if (result?.createMonologue) {
      setMonologues(prev => [...prev, result.createMonologue]);
    }
    return result?.createMonologue;
  }, [executeQuery]);

  const updateMonologue = useCallback(async (id: string, input: UpdateMonologueInput) => {
    const result = await executeQuery(UPDATE_MONOLOGUE, { id, input }) as { updateMonologue: Monologue } | null;
    if (result?.updateMonologue) {
      setMonologues(prev => 
        prev.map(mono => mono.id === id ? result.updateMonologue : mono)
      );
    }
    return result?.updateMonologue;
  }, [executeQuery]);

  const deleteMonologue = useCallback(async (id: string) => {
    const result = await executeQuery(DELETE_MONOLOGUE, { id }) as { deleteMonologue: boolean } | null;
    if (result?.deleteMonologue) {
      setMonologues(prev => prev.filter(mono => mono.id !== id));
    }
    return result?.deleteMonologue;
  }, [executeQuery]);

  const publishMonologue = useCallback(async (id: string) => {
    const result = await executeQuery(PUBLISH_MONOLOGUE, { id }) as { publishMonologue: Monologue } | null;
    if (result?.publishMonologue) {
      setMonologues(prev => 
        prev.map(mono => mono.id === id ? result.publishMonologue : mono)
      );
    }
    return result?.publishMonologue;
  }, [executeQuery]);

  const unpublishMonologue = useCallback(async (id: string) => {
    const result = await executeQuery(UNPUBLISH_MONOLOGUE, { id }) as { unpublishMonologue: Monologue } | null;
    if (result?.unpublishMonologue) {
      setMonologues(prev => 
        prev.map(mono => mono.id === id ? result.unpublishMonologue : mono)
      );
    }
    return result?.unpublishMonologue;
  }, [executeQuery]);

  const generateUrlPreview = useCallback(async (url: string) => {
    return await executeQuery(GENERATE_URL_PREVIEW, { url });
  }, [executeQuery]);

  return {
    monologues,
    loading,
    error,
    fetchMonologues,
    fetchMonologue,
    createMonologue,
    updateMonologue,
    deleteMonologue,
    publishMonologue,
    unpublishMonologue,
    generateUrlPreview,
  };
}

