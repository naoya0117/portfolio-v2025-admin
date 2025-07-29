// GraphQL queries for the admin dashboard

export const GET_BLOG_POSTS = `
  query GetBlogPosts {
    adminBlogPosts {
      id
      title
      slug
      excerpt
      status
      tags
      createdAt
      updatedAt
      publishedAt
    }
  }
`;

export const GET_BLOG_POST = `
  query GetBlogPost($slug: String!) {
    blogPost(slug: $slug) {
      id
      title
      content
      slug
      excerpt
      coverImageUrl
      tags
      status
      seoTitle
      seoDescription
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_BLOG_POST = `
  mutation CreateBlogPost($input: CreateBlogPostInput!) {
    createBlogPost(input: $input) {
      id
      title
      slug
      excerpt
      content
      coverImageUrl
      tags
      status
      seoTitle
      seoDescription
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_BLOG_POST = `
  mutation UpdateBlogPost($id: ID!, $input: UpdateBlogPostInput!) {
    updateBlogPost(id: $id, input: $input) {
      id
      title
      slug
      excerpt
      content
      coverImageUrl
      tags
      status
      seoTitle
      seoDescription
      publishedAt
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_BLOG_POST = `
  mutation DeleteBlogPost($id: ID!) {
    deleteBlogPost(id: $id)
  }
`;

export const GET_MONOLOGUES = `
  query GetMonologues {
    adminMonologues {
      id
      content
      contentType
      tags
      isPublished
      createdAt
      updatedAt
      publishedAt
    }
  }
`;

export const GET_MONOLOGUE = `
  query GetMonologue($id: ID!) {
    monologue(id: $id) {
      id
      content
      contentType
      codeLanguage
      codeSnippet
      tags
      isPublished
      publishedAt
      createdAt
      updatedAt
      url
      urlPreview {
        title
        description
        imageUrl
        siteName
        url
        favicon
        createdAt
      }
      relatedBlogPosts
      series
      category
      likeCount
    }
  }
`;

export const CREATE_MONOLOGUE = `
  mutation CreateMonologue($input: CreateMonologueInput!) {
    createMonologue(input: $input) {
      id
      content
      contentType
      codeLanguage
      codeSnippet
      tags
      isPublished
      publishedAt
      createdAt
      updatedAt
      url
      series
      category
      likeCount
    }
  }
`;

export const UPDATE_MONOLOGUE = `
  mutation UpdateMonologue($id: ID!, $input: UpdateMonologueInput!) {
    updateMonologue(id: $id, input: $input) {
      id
      content
      contentType
      codeLanguage
      codeSnippet
      tags
      isPublished
      publishedAt
      createdAt
      updatedAt
      url
      series
      category
      likeCount
    }
  }
`;

export const DELETE_MONOLOGUE = `
  mutation DeleteMonologue($id: ID!) {
    deleteMonologue(id: $id)
  }
`;

export const PUBLISH_BLOG_POST = `
  mutation PublishBlogPost($id: ID!) {
    publishBlogPost(id: $id) {
      id
      title
      status
      publishedAt
      updatedAt
    }
  }
`;

export const UNPUBLISH_BLOG_POST = `
  mutation UnpublishBlogPost($id: ID!) {
    unpublishBlogPost(id: $id) {
      id
      title
      status
      publishedAt
      updatedAt
    }
  }
`;

export const PUBLISH_MONOLOGUE = `
  mutation PublishMonologue($id: ID!) {
    publishMonologue(id: $id) {
      id
      content
      isPublished
      publishedAt
      updatedAt
    }
  }
`;

export const UNPUBLISH_MONOLOGUE = `
  mutation UnpublishMonologue($id: ID!) {
    unpublishMonologue(id: $id) {
      id
      content
      isPublished
      publishedAt
      updatedAt
    }
  }
`;


export const GENERATE_URL_PREVIEW = `
  mutation GenerateUrlPreview($url: String!) {
    generateUrlPreview(url: $url) {
      title
      description
      imageUrl
      siteName
      url
      favicon
      createdAt
    }
  }
`;