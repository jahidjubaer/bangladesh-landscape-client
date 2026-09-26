import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';

export function useBlogs({ district, q, page } = {}) {
  return useQuery({
    queryKey: ['blogs', district || '', q || '', page || 1],
    queryFn: async () =>
      (await api.get('/blogs', { params: { district: district || undefined, q: q || undefined, page } })).data.data,
  });
}

export function useBlog(slug) {
  return useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => (await api.get(`/blogs/${slug}`)).data.data.blog,
    enabled: Boolean(slug),
  });
}

export function useMyBlogs() {
  return useQuery({
    queryKey: ['myBlogs'],
    queryFn: async () => (await api.get('/blogs/me/list')).data.data.blogs,
  });
}

export function useMyBlog(id) {
  return useQuery({
    queryKey: ['myBlog', id],
    queryFn: async () => (await api.get(`/blogs/me/${id}`)).data.data.blog,
    enabled: Boolean(id),
  });
}

export function useSaveBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) =>
      id ? (await api.patch(`/blogs/${id}`, payload)).data : (await api.post('/blogs', payload)).data,
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useDeleteBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await api.delete(`/blogs/${id}`)).data,
    onSuccess: () => qc.invalidateQueries(),
  });
}

export async function uploadBlogImage(file) {
  const fd = new FormData();
  fd.append('image', file);
  return (await api.post('/blogs/uploads', fd)).data.data.url;
}
