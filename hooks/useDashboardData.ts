import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import { 
  GET_BLOG_POSTS, 
  GET_MONOLOGUES 
} from '@/lib/graphql-queries';

interface DashboardStats {
  totalBlogPosts: number;
  publishedBlogPosts: number;
  draftBlogPosts: number;
  totalMonologues: number;
  publishedMonologues: number;
  draftMonologues: number;
  loading: boolean;
  error: string | null;
}

interface BlogPost {
  id: string;
  title: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

interface Monologue {
  id: string;
  content: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export function useDashboardData(): DashboardStats {
  const [stats, setStats] = useState<DashboardStats>({
    totalBlogPosts: 0,
    publishedBlogPosts: 0,
    draftBlogPosts: 0,
    totalMonologues: 0,
    publishedMonologues: 0,
    draftMonologues: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true, error: null }));

        // ブログ記事データを取得
        const blogPostsResponse = await ApiClient.graphql<{ adminBlogPosts: BlogPost[] }>(
          GET_BLOG_POSTS
        );

        // モノローグデータを取得
        const monologuesResponse = await ApiClient.graphql<{
          adminMonologues: Monologue[]
        }>(
          GET_MONOLOGUES
        );

        const blogPosts = blogPostsResponse.adminBlogPosts || [];
        const monologues = monologuesResponse.adminMonologues || [];

        // ブログ記事の統計計算
        const publishedBlogs = blogPosts.filter(post => post.status === 'PUBLISHED').length;
        const draftBlogs = blogPosts.filter(post => post.status === 'DRAFT').length;

        // モノローグの統計計算
        const publishedMonos = monologues.filter(mono => mono.isPublished).length;
        const draftMonos = monologues.filter(mono => !mono.isPublished).length;

        setStats({
          totalBlogPosts: blogPosts.length,
          publishedBlogPosts: publishedBlogs,
          draftBlogPosts: draftBlogs,
          totalMonologues: monologues.length,
          publishedMonologues: publishedMonos,
          draftMonologues: draftMonos,
          loading: false,
          error: null,
        });

      } catch (error) {
        console.error('Dashboard data fetch error:', error);
        let errorMessage = 'データの取得に失敗しました';
        
        if (error instanceof Error) {
          console.error('Detailed error message:', error.message);
          if (error.message.includes('認証が必要')) {
            errorMessage = 'ログインが必要です。ページを再読み込みしてログインしてください。';
          } else if (error.message.includes('GraphQL Error')) {
            errorMessage = `サーバーエラー: ${error.message}`;
          } else if (error.message.includes('syntax error')) {
            errorMessage = `SQL構文エラー: ${error.message}`;
          } else {
            errorMessage = error.message;
          }
        }
        
        setStats(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      }
    };

    fetchData();
  }, []);

  return stats;
}

export function useRecentActivity() {
  const [activities, setActivities] = useState<Array<{
    id: string;
    type: 'blog' | 'monologue';
    title: string;
    description: string;
    timestamp: string;
    icon: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        // 実際のデータを取得してアクティビティリストを構築
        const [blogResponse, monoResponse] = await Promise.all([
          ApiClient.graphql<{ adminBlogPosts: BlogPost[] }>(GET_BLOG_POSTS),
          ApiClient.graphql<{ adminMonologues: Monologue[] }>(GET_MONOLOGUES)
        ]);

        const blogPosts = blogResponse.adminBlogPosts || [];
        const monologues = monoResponse.adminMonologues || [];

        // 最新のアクティビティを作成（作成日時順）
        const recentActivities: Array<{
          id: string;
          type: 'blog' | 'monologue';
          title: string;
          description: string;
          timestamp: string;
          icon: string;
        }> = [];

        // 最新のブログ記事
        const recentBlogs = blogPosts
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 3);

        recentBlogs.forEach(blog => {
          recentActivities.push({
            id: blog.id,
            type: 'blog' as const,
            title: blog.status === 'PUBLISHED' ? 'ブログ記事を公開' : 'ブログ記事を更新',
            description: blog.title,
            timestamp: formatRelativeTime(blog.updatedAt),
            icon: blog.status === 'PUBLISHED' ? '📝' : '📄'
          });
        });

        // 最新のモノローグ
        const recentMonos = monologues
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 3);

        recentMonos.forEach(mono => {
          recentActivities.push({
            id: mono.id,
            type: 'monologue' as const,
            title: mono.isPublished ? 'モノローグを公開' : 'モノローグを更新',
            description: mono.content.substring(0, 50) + (mono.content.length > 50 ? '...' : ''),
            timestamp: formatRelativeTime(mono.updatedAt),
            icon: '💭'
          });
        });

        // 更新日時でソートして最新6件を取得
        const sortedActivities = recentActivities
          .sort((a, b) => {
            // timestampから実際の日時を逆算するのは複雑なので、元データの更新日時を使用
            const aTime = recentBlogs.find(b => b.id === a.id)?.updatedAt ||
                         recentMonos.find(m => m.id === a.id)?.updatedAt || '';
            const bTime = recentBlogs.find(blog => blog.id === b.id)?.updatedAt ||
                         recentMonos.find(m => m.id === b.id)?.updatedAt || '';
            return new Date(bTime).getTime() - new Date(aTime).getTime();
          })
          .slice(0, 6);

        setActivities(sortedActivities);
      } catch (error) {
        console.error('Recent activity fetch error:', error);
        // エラーが発生してもアクティビティは空のままにし、ローディングだけ停止
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  return { activities, loading };
}

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return '1分未満前';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分前`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}時間前`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}日前`;
  
  return date.toLocaleDateString('ja-JP');
}