import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminLayout from '@/components/AdminLayout';
import { Plus, Edit2, Trash2, Eye, Search, Filter, Calendar, User, Tag, FileText, TrendingUp, Settings, Bot, Key } from 'lucide-react';

interface BlogPost {
  id: number;
  slug: string;
  title_en: string;
  title_fa: string;
  summary_en?: string;
  summary_fa?: string;
  content_en: string;
  content_fa: string;
  featured_image?: string;
  gallery?: string[];
  video_url?: string;
  category_id?: number;
  category_slug?: string;
  category_name_en?: string;
  category_name_fa?: string;
  author_name: string;
  author_avatar?: string;
  published_date?: string;
  updated_date?: string;
  reading_time: number;
  views: number;
  likes: number;
  shares: number;
  is_featured: boolean;
  is_trending: boolean;
  is_published: boolean;
  post_type: 'article' | 'video' | 'guide' | 'news';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  meta_title_en?: string;
  meta_title_fa?: string;
  meta_description_en?: string;
  meta_description_fa?: string;
  meta_keywords?: string[];
  og_image?: string;
  canonical_url?: string;
  status: 'draft' | 'published' | 'archived';
  tags?: Array<{ slug: string; name_en: string; name_fa: string }>;
  seo?: {
    meta_description_en?: string;
    meta_description_fa?: string;
    keywords?: string[];
  };
}

interface BlogCategory {
  id: number;
  slug: string;
  name_en: string;
  name_fa: string;
  description_en?: string;
  description_fa?: string;
  color?: string;
  post_count: number;
}

export default function AdminBlog() {
  const { language, dir } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(false);
  
  // Post Dialog
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [postForm, setPostForm] = useState<Partial<BlogPost>>({
    title_en: '',
    title_fa: '',
    summary_en: '',
    summary_fa: '',
    content_en: '',
    content_fa: '',
    post_type: 'article',
    status: 'draft',
    meta_keywords: [],
  });

  // Fetch posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('status', filterStatus);
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/admin/blog/posts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/blog/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [filterStatus, filterCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPosts();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredPosts = useMemo(() => {
    return posts;
  }, [posts]);

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-500',
    published: 'bg-green-500',
    archived: 'bg-gray-400',
  };

  const savePost = async () => {
    try {
      if (!postForm.title_en || !postForm.title_fa || !postForm.content_en || !postForm.content_fa) {
        alert(language === 'fa' ? 'لطفا فیلدهای الزامی را پر کنید' : 'Please fill required fields');
        return;
      }

      // Generate slug from title
      const slug = (postForm.slug || (postForm.title_en || 'untitled')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')) + (editingPost ? '' : '-' + Date.now());

      const postData = {
        ...postForm,
        slug,
        gallery: postForm.gallery || [],
        meta_keywords: postForm.meta_keywords || [],
      };

      const url = editingPost 
        ? `/api/admin/blog/posts/${editingPost.id}`
        : '/api/admin/blog/posts';
      
      const method = editingPost ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });

      if (!response.ok) throw new Error('Failed to save post');

      await fetchPosts();
      setPostDialogOpen(false);
      setEditingPost(null);
      setPostForm({
        title_en: '',
        title_fa: '',
        summary_en: '',
        summary_fa: '',
        content_en: '',
        content_fa: '',
        post_type: 'article',
        status: 'draft',
        meta_keywords: [],
      });
    } catch (error) {
      console.error('Error saving post:', error);
      alert(language === 'fa' ? 'خطا در ذخیره پست' : 'Error saving post');
    }
  };

  const deletePost = async (id: number) => {
    if (!confirm(language === 'fa' ? 'آیا از حذف این پست مطمئن هستید؟' : 'Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/blog/posts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete post');

      await fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(language === 'fa' ? 'خطا در حذف پست' : 'Error deleting post');
    }
  };

  const openEditDialog = (post: BlogPost) => {
    setEditingPost(post);
    setPostForm({
      ...post,
      gallery: post.gallery || [],
      meta_keywords: post.meta_keywords || [],
    });
    setPostDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6" dir={dir}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {language === 'fa' ? 'مدیریت بلاگ' : 'Blog Management'}
            </h2>
            <p className="text-gray-600">
              {language === 'fa' ? 'ایجاد و مدیریت مطالب بلاگ برای SEO' : 'Create and manage blog content for SEO'}
            </p>
          </div>
          <Dialog open={postDialogOpen} onOpenChange={setPostDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingPost(null);
                setPostForm({
                  title_en: '',
                  title_fa: '',
                  summary_en: '',
                  summary_fa: '',
                  content_en: '',
                  content_fa: '',
                  post_type: 'article',
                  status: 'draft',
                  meta_keywords: [],
                });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                {language === 'fa' ? 'پست جدید' : 'New Post'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPost 
                    ? (language === 'fa' ? 'ویرایش پست' : 'Edit Post')
                    : (language === 'fa' ? 'پست جدید' : 'New Post')
                  }
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{language === 'fa' ? 'عنوان (انگلیسی)' : 'Title (English)'} *</Label>
                    <Input
                      value={postForm.title_en || ''}
                      onChange={(e) => setPostForm({ ...postForm, title_en: e.target.value })}
                      placeholder="Post title in English"
                    />
                  </div>
                  <div>
                    <Label>{language === 'fa' ? 'عنوان (فارسی)' : 'Title (Persian)'} *</Label>
                    <Input
                      value={postForm.title_fa || ''}
                      onChange={(e) => setPostForm({ ...postForm, title_fa: e.target.value })}
                      placeholder="عنوان پست به فارسی"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{language === 'fa' ? 'خلاصه (انگلیسی)' : 'Summary (English)'}</Label>
                    <Textarea
                      value={postForm.summary_en || ''}
                      onChange={(e) => setPostForm({ ...postForm, summary_en: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>{language === 'fa' ? 'خلاصه (فارسی)' : 'Summary (Persian)'}</Label>
                    <Textarea
                      value={postForm.summary_fa || ''}
                      onChange={(e) => setPostForm({ ...postForm, summary_fa: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{language === 'fa' ? 'محتوا (انگلیسی)' : 'Content (English)'} *</Label>
                    <Textarea
                      value={postForm.content_en || ''}
                      onChange={(e) => setPostForm({ ...postForm, content_en: e.target.value })}
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div>
                    <Label>{language === 'fa' ? 'محتوا (فارسی)' : 'Content (Persian)'} *</Label>
                    <Textarea
                      value={postForm.content_fa || ''}
                      onChange={(e) => setPostForm({ ...postForm, content_fa: e.target.value })}
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>{language === 'fa' ? 'نوع پست' : 'Post Type'}</Label>
                    <Select
                      value={postForm.post_type || 'article'}
                      onValueChange={(v) => setPostForm({ ...postForm, post_type: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="article">{language === 'fa' ? 'مقاله' : 'Article'}</SelectItem>
                        <SelectItem value="video">{language === 'fa' ? 'ویدیو' : 'Video'}</SelectItem>
                        <SelectItem value="guide">{language === 'fa' ? 'راهنما' : 'Guide'}</SelectItem>
                        <SelectItem value="news">{language === 'fa' ? 'خبر' : 'News'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{language === 'fa' ? 'دسته‌بندی' : 'Category'}</Label>
                    <Select
                      value={String(postForm.category_id || '')}
                      onValueChange={(v) => setPostForm({ ...postForm, category_id: v ? parseInt(v) : undefined })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{language === 'fa' ? 'بدون دسته' : 'No Category'}</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {language === 'fa' ? cat.name_fa : cat.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{language === 'fa' ? 'وضعیت' : 'Status'}</Label>
                    <Select
                      value={postForm.status || 'draft'}
                      onValueChange={(v) => setPostForm({ ...postForm, status: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">{language === 'fa' ? 'پیش‌نویس' : 'Draft'}</SelectItem>
                        <SelectItem value="published">{language === 'fa' ? 'منتشر شده' : 'Published'}</SelectItem>
                        <SelectItem value="archived">{language === 'fa' ? 'آرشیو' : 'Archived'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{language === 'fa' ? 'تصویر شاخص' : 'Featured Image URL'}</Label>
                    <Input
                      value={postForm.featured_image || ''}
                      onChange={(e) => setPostForm({ ...postForm, featured_image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div>
                    <Label>{language === 'fa' ? 'ویدیو URL' : 'Video URL'}</Label>
                    <Input
                      value={postForm.video_url || ''}
                      onChange={(e) => setPostForm({ ...postForm, video_url: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-lg font-semibold">{language === 'fa' ? 'تنظیمات SEO' : 'SEO Settings'}</Label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{language === 'fa' ? 'Meta Title (EN)' : 'Meta Title (English)'}</Label>
                    <Input
                      value={postForm.meta_title_en || ''}
                      onChange={(e) => setPostForm({ ...postForm, meta_title_en: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>{language === 'fa' ? 'Meta Title (FA)' : 'Meta Title (Persian)'}</Label>
                    <Input
                      value={postForm.meta_title_fa || ''}
                      onChange={(e) => setPostForm({ ...postForm, meta_title_fa: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{language === 'fa' ? 'Meta Description (EN)' : 'Meta Description (English)'}</Label>
                    <Textarea
                      value={postForm.meta_description_en || ''}
                      onChange={(e) => setPostForm({ ...postForm, meta_description_en: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>{language === 'fa' ? 'Meta Description (FA)' : 'Meta Description (Persian)'}</Label>
                    <Textarea
                      value={postForm.meta_description_fa || ''}
                      onChange={(e) => setPostForm({ ...postForm, meta_description_fa: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>

                <div>
                  <Label>{language === 'fa' ? 'کلمات کلیدی (جدا شده با کاما)' : 'Keywords (comma separated)'}</Label>
                  <Input
                    value={postForm.meta_keywords?.join(', ') || ''}
                    onChange={(e) => setPostForm({
                      ...postForm,
                      meta_keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                    })}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{language === 'fa' ? 'OG Image URL' : 'OG Image URL'}</Label>
                    <Input
                      value={postForm.og_image || ''}
                      onChange={(e) => setPostForm({ ...postForm, og_image: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>{language === 'fa' ? 'Canonical URL' : 'Canonical URL'}</Label>
                    <Input
                      value={postForm.canonical_url || ''}
                      onChange={(e) => setPostForm({ ...postForm, canonical_url: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={postForm.is_featured || false}
                      onChange={(e) => setPostForm({ ...postForm, is_featured: e.target.checked })}
                    />
                    <span>{language === 'fa' ? 'ویژه' : 'Featured'}</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={postForm.is_trending || false}
                      onChange={(e) => setPostForm({ ...postForm, is_trending: e.target.checked })}
                    />
                    <span>{language === 'fa' ? 'ترند' : 'Trending'}</span>
                  </label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setPostDialogOpen(false);
                    setEditingPost(null);
                  }}>
                    {language === 'fa' ? 'انصراف' : 'Cancel'}
                  </Button>
                  <Button onClick={savePost}>
                    {language === 'fa' ? 'ذخیره' : 'Save'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">
              <FileText className="w-4 h-4 mr-2" />
              {language === 'fa' ? 'پست‌ها' : 'Posts'}
            </TabsTrigger>
            <TabsTrigger value="categories">
              <Tag className="w-4 h-4 mr-2" />
              {language === 'fa' ? 'دسته‌بندی‌ها' : 'Categories'}
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Bot className="w-4 h-4 mr-2" />
              {language === 'fa' ? 'AI Integration' : 'AI Integration'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{language === 'fa' ? 'پست‌های بلاگ' : 'Blog Posts'}</CardTitle>
                  <div className="flex gap-2">
                    <Input
                      placeholder={language === 'fa' ? 'جستجو...' : 'Search...'}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-64"
                    />
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{language === 'fa' ? 'همه' : 'All'}</SelectItem>
                        <SelectItem value="draft">{language === 'fa' ? 'پیش‌نویس' : 'Draft'}</SelectItem>
                        <SelectItem value="published">{language === 'fa' ? 'منتشر شده' : 'Published'}</SelectItem>
                        <SelectItem value="archived">{language === 'fa' ? 'آرشیو' : 'Archived'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === 'fa' ? 'عنوان' : 'Title'}</TableHead>
                        <TableHead>{language === 'fa' ? 'دسته‌بندی' : 'Category'}</TableHead>
                        <TableHead>{language === 'fa' ? 'نوع' : 'Type'}</TableHead>
                        <TableHead>{language === 'fa' ? 'وضعیت' : 'Status'}</TableHead>
                        <TableHead>{language === 'fa' ? 'بازدید' : 'Views'}</TableHead>
                        <TableHead>{language === 'fa' ? 'تاریخ' : 'Date'}</TableHead>
                        <TableHead>{language === 'fa' ? 'عملیات' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            {language === 'fa' ? 'در حال بارگذاری...' : 'Loading...'}
                          </TableCell>
                        </TableRow>
                      ) : filteredPosts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-gray-500">
                            {language === 'fa' ? 'پستی یافت نشد' : 'No posts found'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPosts.map(post => (
                          <TableRow key={post.id}>
                            <TableCell className="font-medium">
                              {language === 'fa' ? post.title_fa : post.title_en}
                            </TableCell>
                            <TableCell>
                              {post.category_name_en ? (language === 'fa' ? post.category_name_fa : post.category_name_en) : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{post.post_type}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColors[post.status] || 'bg-gray-500'}>
                                {post.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{post.views}</TableCell>
                            <TableCell>
                              {post.published_date 
                                ? new Date(post.published_date).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')
                                : '-'
                              }
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openEditDialog(post)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deletePost(post.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'fa' ? 'دسته‌بندی‌ها' : 'Categories'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {categories.map(cat => (
                    <Card key={cat.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {language === 'fa' ? cat.name_fa : cat.name_en}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">
                          {language === 'fa' ? cat.description_fa : cat.description_en}
                        </p>
                        <Badge className="mt-2">{cat.post_count} {language === 'fa' ? 'پست' : 'posts'}</Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  {language === 'fa' ? 'یکپارچه‌سازی هوش مصنوعی' : 'AI Integration'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    {language === 'fa' 
                      ? 'از این بخش می‌توانید API Key برای هوش‌های مصنوعی ایجاد کنید تا بتوانند مطالب را به صورت خودکار بارگذاری کنند.'
                      : 'Create API keys for AI assistants to automatically publish content.'
                    }
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-2">{language === 'fa' ? 'نحوه استفاده:' : 'How to use:'}</h4>
                    <code className="text-xs block bg-white p-2 rounded">
                      POST /api/ai/blog/posts<br/>
                      Headers: X-AI-API-Key: your_api_key<br/>
                      Body: {'{'} title_en, title_fa, content_en, content_fa, ... {'}'}
                    </code>
                  </div>
                  <Button>
                    <Key className="w-4 h-4 mr-2" />
                    {language === 'fa' ? 'ایجاد API Key جدید' : 'Create New API Key'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

