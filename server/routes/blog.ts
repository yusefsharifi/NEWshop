import { RequestHandler } from "express";
import { db } from "../database/init";

// Get all blog posts
export const getBlogPosts: RequestHandler = (req, res) => {
  const { status, category, tag, search, featured, trending, type, limit, offset } = req.query;

  let query = `
    SELECT 
      bp.*,
      bc.slug as category_slug,
      bc.name_en as category_name_en,
      bc.name_fa as category_name_fa,
      GROUP_CONCAT(DISTINCT bt.slug) as tag_slugs,
      GROUP_CONCAT(DISTINCT bt.name_en) as tag_names_en,
      GROUP_CONCAT(DISTINCT bt.name_fa) as tag_names_fa
    FROM blog_posts bp
    LEFT JOIN blog_categories bc ON bp.category_id = bc.id
    LEFT JOIN blog_post_tags bpt ON bp.id = bpt.post_id
    LEFT JOIN blog_tags bt ON bpt.tag_id = bt.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status && status !== 'all') {
    query += ` AND bp.status = ?`;
    params.push(status);
  }

  if (category) {
    query += ` AND bc.slug = ?`;
    params.push(category);
  }

  if (tag) {
    query += ` AND bt.slug = ?`;
    params.push(tag);
  }

  if (search) {
    query += ` AND (bp.title_en LIKE ? OR bp.title_fa LIKE ? OR bp.content_en LIKE ? OR bp.content_fa LIKE ?)`;
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }

  if (featured === 'true') {
    query += ` AND bp.is_featured = 1`;
  }

  if (trending === 'true') {
    query += ` AND bp.is_trending = 1`;
  }

  if (type) {
    query += ` AND bp.post_type = ?`;
    params.push(type);
  }

  query += ` GROUP BY bp.id ORDER BY bp.published_date DESC, bp.created_at DESC`;

  if (limit) {
    query += ` LIMIT ?`;
    params.push(parseInt(limit as string));
    if (offset) {
      query += ` OFFSET ?`;
      params.push(parseInt(offset as string));
    }
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching blog posts:', err);
      return res.status(500).json({ error: 'Failed to fetch blog posts' });
    }

    // Format posts with tags
    const posts = rows.map((post: any) => {
      const tags = post.tag_slugs ? post.tag_slugs.split(',') : [];
      const tagNamesEn = post.tag_names_en ? post.tag_names_en.split(',') : [];
      const tagNamesFa = post.tag_names_fa ? post.tag_names_fa.split(',') : [];
      
      return {
        ...post,
        tags: tags.map((slug: string, idx: number) => ({
          slug,
          name_en: tagNamesEn[idx] || '',
          name_fa: tagNamesFa[idx] || ''
        })),
        gallery: post.gallery ? JSON.parse(post.gallery) : [],
        meta_keywords: post.meta_keywords ? JSON.parse(post.meta_keywords) : [],
        seo: {
          meta_description_en: post.meta_description_en,
          meta_description_fa: post.meta_description_fa,
          keywords: post.meta_keywords ? JSON.parse(post.meta_keywords) : []
        }
      };
    });

    res.json(posts);
  });
};

// Get blog post by ID or slug
export const getBlogPost: RequestHandler = (req, res) => {
  const { id } = req.params;
  const isSlug = !/^\d+$/.test(id);

  const query = isSlug
    ? `SELECT * FROM blog_posts WHERE slug = ?`
    : `SELECT * FROM blog_posts WHERE id = ?`;

  db.get(query, [id], (err, post: any) => {
    if (err) {
      console.error('Error fetching blog post:', err);
      return res.status(500).json({ error: 'Failed to fetch blog post' });
    }

    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    // Get category
    db.get(
      `SELECT * FROM blog_categories WHERE id = ?`,
      [post.category_id],
      (err, category) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch category' });
        }

        // Get tags
        db.all(
          `SELECT bt.* FROM blog_tags bt
           JOIN blog_post_tags bpt ON bt.id = bpt.tag_id
           WHERE bpt.post_id = ?`,
          [post.id],
          (err, tags) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to fetch tags' });
            }

            // Increment views
            db.run(
              `UPDATE blog_posts SET views = views + 1 WHERE id = ?`,
              [post.id]
            );

            res.json({
              ...post,
              category: category || null,
              tags: tags || [],
              gallery: post.gallery ? JSON.parse(post.gallery) : [],
              meta_keywords: post.meta_keywords ? JSON.parse(post.meta_keywords) : [],
              seo: {
                meta_description_en: post.meta_description_en,
                meta_description_fa: post.meta_description_fa,
                keywords: post.meta_keywords ? JSON.parse(post.meta_keywords) : []
              }
            });
          }
        );
      }
    );
  });
};

// Create blog post
export const createBlogPost: RequestHandler = (req, res) => {
  const {
    slug,
    title_en,
    title_fa,
    summary_en,
    summary_fa,
    content_en,
    content_fa,
    featured_image,
    gallery,
    video_url,
    category_id,
    author_id,
    author_name,
    author_avatar,
    author_bio_en,
    author_bio_fa,
    published_date,
    reading_time,
    is_featured,
    is_trending,
    post_type,
    difficulty,
    meta_title_en,
    meta_title_fa,
    meta_description_en,
    meta_description_fa,
    meta_keywords,
    og_image,
    canonical_url,
    status,
    tags
  } = req.body;

  if (!slug || !title_en || !title_fa || !content_en || !content_fa) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Calculate reading time if not provided
  const estimatedReadingTime = reading_time || Math.ceil(
    (content_en.length + content_fa.length) / 1000 // ~1000 chars per minute
  );

  db.run(
    `INSERT INTO blog_posts (
      slug, title_en, title_fa, summary_en, summary_fa, content_en, content_fa,
      featured_image, gallery, video_url, category_id, author_id, author_name,
      author_avatar, author_bio_en, author_bio_fa, published_date, reading_time,
      is_featured, is_trending, post_type, difficulty, meta_title_en, meta_title_fa,
      meta_description_en, meta_description_fa, meta_keywords, og_image,
      canonical_url, status, is_published
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      slug,
      title_en,
      title_fa,
      summary_en || null,
      summary_fa || null,
      content_en,
      content_fa,
      featured_image || null,
      gallery ? JSON.stringify(gallery) : null,
      video_url || null,
      category_id || null,
      author_id || null,
      author_name || 'Admin',
      author_avatar || null,
      author_bio_en || null,
      author_bio_fa || null,
      published_date || new Date().toISOString(),
      estimatedReadingTime,
      is_featured ? 1 : 0,
      is_trending ? 1 : 0,
      post_type || 'article',
      difficulty || null,
      meta_title_en || null,
      meta_title_fa || null,
      meta_description_en || null,
      meta_description_fa || null,
      meta_keywords ? JSON.stringify(meta_keywords) : null,
      og_image || null,
      canonical_url || null,
      status || 'draft',
      status === 'published' ? 1 : 0
    ],
    function (err) {
      if (err) {
        console.error('Error creating blog post:', err);
        return res.status(500).json({ error: 'Failed to create blog post' });
      }

      const postId = this.lastID;

      // Add tags if provided
      if (tags && Array.isArray(tags) && tags.length > 0) {
        addTagsToPost(postId, tags, (tagErr) => {
          if (tagErr) {
            console.error('Error adding tags:', tagErr);
          }
        });
      }

      res.json({
        success: true,
        id: postId,
        slug
      });
    }
  );
};

// Update blog post
export const updateBlogPost: RequestHandler = (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  // Build dynamic update query
  const allowedFields = [
    'slug', 'title_en', 'title_fa', 'summary_en', 'summary_fa',
    'content_en', 'content_fa', 'featured_image', 'gallery', 'video_url',
    'category_id', 'author_name', 'author_avatar', 'author_bio_en', 'author_bio_fa',
    'published_date', 'reading_time', 'is_featured', 'is_trending',
    'post_type', 'difficulty', 'meta_title_en', 'meta_title_fa',
    'meta_description_en', 'meta_description_fa', 'meta_keywords',
    'og_image', 'canonical_url', 'status'
  ];

  const updates: string[] = [];
  const values: any[] = [];

  allowedFields.forEach(field => {
    if (updateFields[field] !== undefined) {
      if (field === 'gallery' && Array.isArray(updateFields[field])) {
        updates.push(`${field} = ?`);
        values.push(JSON.stringify(updateFields[field]));
      } else if (field === 'meta_keywords' && Array.isArray(updateFields[field])) {
        updates.push(`${field} = ?`);
        values.push(JSON.stringify(updateFields[field]));
      } else if (field === 'is_featured' || field === 'is_trending') {
        updates.push(`${field} = ?`);
        values.push(updateFields[field] ? 1 : 0);
      } else {
        updates.push(`${field} = ?`);
        values.push(updateFields[field]);
      }
    }
  });

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  updates.push('updated_date = CURRENT_TIMESTAMP');
  
  // Update is_published based on status
  if (updateFields.status) {
    updates.push('is_published = ?');
    values.push(updateFields.status === 'published' ? 1 : 0);
  }

  values.push(id);

  db.run(
    `UPDATE blog_posts SET ${updates.join(', ')} WHERE id = ?`,
    values,
    function (err) {
      if (err) {
        console.error('Error updating blog post:', err);
        return res.status(500).json({ error: 'Failed to update blog post' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Blog post not found' });
      }

      // Update tags if provided
      if (updateFields.tags && Array.isArray(updateFields.tags)) {
        // Remove existing tags
        db.run(`DELETE FROM blog_post_tags WHERE post_id = ?`, [id], (err) => {
          if (err) {
            console.error('Error removing tags:', err);
          } else {
            // Add new tags
            addTagsToPost(parseInt(id), updateFields.tags, (tagErr) => {
              if (tagErr) {
                console.error('Error adding tags:', tagErr);
              }
            });
          }
        });
      }

      res.json({ success: true, id: parseInt(id) });
    }
  );
};

// Delete blog post
export const deleteBlogPost: RequestHandler = (req, res) => {
  const { id } = req.params;

  db.run(`DELETE FROM blog_posts WHERE id = ?`, [id], function (err) {
    if (err) {
      console.error('Error deleting blog post:', err);
      return res.status(500).json({ error: 'Failed to delete blog post' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    res.json({ success: true });
  });
};

// Get blog categories
export const getBlogCategories: RequestHandler = (req, res) => {
  db.all(
    `SELECT 
      bc.*,
      COUNT(bp.id) as post_count
    FROM blog_categories bc
    LEFT JOIN blog_posts bp ON bc.id = bp.category_id AND bp.status = 'published'
    WHERE bc.is_active = 1
    GROUP BY bc.id
    ORDER BY bc.name_en`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Error fetching categories:', err);
        return res.status(500).json({ error: 'Failed to fetch categories' });
      }

      res.json(rows);
    }
  );
};

// Create blog category
export const createBlogCategory: RequestHandler = (req, res) => {
  const { slug, name_en, name_fa, description_en, description_fa, color, icon } = req.body;

  if (!slug || !name_en || !name_fa) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    `INSERT INTO blog_categories (slug, name_en, name_fa, description_en, description_fa, color, icon)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [slug, name_en, name_fa, description_en || null, description_fa || null, color || 'blue', icon || null],
    function (err) {
      if (err) {
        console.error('Error creating category:', err);
        return res.status(500).json({ error: 'Failed to create category' });
      }

      res.json({ success: true, id: this.lastID, slug });
    }
  );
};

// Helper function to add tags to post
function addTagsToPost(postId: number, tags: string[], callback: (err: Error | null) => void) {
  if (!tags || tags.length === 0) {
    return callback(null);
  }

  let processed = 0;
  let hasError = false;

  tags.forEach((tagSlug) => {
    // Find or create tag
    db.get(`SELECT id FROM blog_tags WHERE slug = ?`, [tagSlug], (err, tag: any) => {
      if (err) {
        hasError = true;
        return callback(err);
      }

      let tagId: number;

      if (tag) {
        tagId = tag.id;
        linkTagToPost(postId, tagId, callback);
      } else {
        // Create new tag
        db.run(
          `INSERT INTO blog_tags (slug, name_en, name_fa) VALUES (?, ?, ?)`,
          [tagSlug, tagSlug, tagSlug],
          function (err) {
            if (err) {
              hasError = true;
              return callback(err);
            }

            tagId = this.lastID;
            linkTagToPost(postId, tagId, callback);
          }
        );
      }
    });
  });
}

function linkTagToPost(postId: number, tagId: number, callback: (err: Error | null) => void) {
  db.run(
    `INSERT OR IGNORE INTO blog_post_tags (post_id, tag_id) VALUES (?, ?)`,
    [postId, tagId],
    (err) => {
      if (err) {
        return callback(err);
      }
      callback(null);
    }
  );
}

