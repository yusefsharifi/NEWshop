import { RequestHandler } from "express";
import { db } from "../database/init";
import { createBlogPost } from "./blog";

// Middleware to verify AI API key
export const verifyAIKey: RequestHandler = (req, res, next) => {
  const apiKey = req.headers['x-ai-api-key'] || req.body.api_key;

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  db.get(
    `SELECT * FROM ai_api_keys WHERE api_key = ? AND is_active = 1`,
    [apiKey],
    (err, key: any) => {
      if (err) {
        console.error('Error verifying API key:', err);
        return res.status(500).json({ error: 'Failed to verify API key' });
      }

      if (!key) {
        return res.status(401).json({ error: 'Invalid or inactive API key' });
      }

      // Check rate limit
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      db.get(
        `SELECT COUNT(*) as count FROM ai_activity_log 
         WHERE api_key_id = ? AND created_at > ?`,
        [key.id, oneHourAgo],
        (err, usage: any) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to check rate limit' });
          }

          if (usage.count >= key.rate_limit) {
            return res.status(429).json({ error: 'Rate limit exceeded' });
          }

          // Attach key info to request
          (req as any).aiKey = key;
          next();
        }
      );
    }
  );
};

// Log AI activity
function logAIActivity(
  apiKeyId: number,
  action: string,
  resourceType: string | null,
  resourceId: number | null,
  requestData: any,
  responseData: any,
  status: string,
  errorMessage: string | null,
  req: any
) {
  db.run(
    `INSERT INTO ai_activity_log (
      api_key_id, action, resource_type, resource_id,
      request_data, response_data, status, error_message,
      ip_address, user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      apiKeyId,
      action,
      resourceType,
      resourceId,
      JSON.stringify(requestData),
      JSON.stringify(responseData),
      status,
      errorMessage,
      req.ip || req.headers['x-forwarded-for'] || 'unknown',
      req.headers['user-agent'] || 'unknown'
    ],
    (err) => {
      if (err) {
        console.error('Error logging AI activity:', err);
      }
    }
  );

  // Update API key usage
  db.run(
    `UPDATE ai_api_keys 
     SET usage_count = usage_count + 1, last_used_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [apiKeyId]
  );
}

// AI Create Blog Post
export const aiCreateBlogPost: RequestHandler = async (req, res) => {
  const aiKey = (req as any).aiKey;
  const {
    title_en,
    title_fa,
    content_en,
    content_fa,
    summary_en,
    summary_fa,
    category_slug,
    tags,
    featured_image,
    meta_description_en,
    meta_description_fa,
    meta_keywords,
    status = 'draft',
    ...otherFields
  } = req.body;

  try {
    // Check permissions
    const permissions = aiKey.permissions ? JSON.parse(aiKey.permissions) : [];
    if (permissions.length > 0 && !permissions.includes('create_post')) {
      logAIActivity(
        aiKey.id,
        'create_post',
        'blog_post',
        null,
        req.body,
        { error: 'Permission denied' },
        'error',
        'Permission denied: create_post',
        req
      );
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Get category ID if category_slug provided
    let categoryId = null;
    if (category_slug) {
      const category = await new Promise<any>((resolve, reject) => {
        db.get(
          `SELECT id FROM blog_categories WHERE slug = ?`,
          [category_slug],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
      if (category) {
        categoryId = category.id;
      }
    }

    // Generate slug from title
    const slug = (title_en || title_fa || 'untitled')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Date.now();

    // Create blog post
    const postData = {
      slug,
      title_en: title_en || title_fa || 'Untitled',
      title_fa: title_fa || title_en || 'بدون عنوان',
      summary_en: summary_en || null,
      summary_fa: summary_fa || null,
      content_en: content_en || '',
      content_fa: content_fa || '',
      featured_image: featured_image || null,
      category_id: categoryId,
      author_name: 'AI Assistant',
      published_date: status === 'published' ? new Date().toISOString() : null,
      meta_description_en: meta_description_en || null,
      meta_description_fa: meta_description_fa || null,
      meta_keywords: meta_keywords || [],
      status,
      tags: tags || [],
      ...otherFields
    };

    // Use the createBlogPost logic
    db.run(
      `INSERT INTO blog_posts (
        slug, title_en, title_fa, summary_en, summary_fa, content_en, content_fa,
        featured_image, category_id, author_name, published_date, reading_time,
        meta_description_en, meta_description_fa, meta_keywords, status, is_published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        postData.slug,
        postData.title_en,
        postData.title_fa,
        postData.summary_en,
        postData.summary_fa,
        postData.content_en,
        postData.content_fa,
        postData.featured_image,
        postData.category_id,
        postData.author_name,
        postData.published_date,
        Math.ceil((postData.content_en.length + postData.content_fa.length) / 1000),
        postData.meta_description_en,
        postData.meta_description_fa,
        postData.meta_keywords ? JSON.stringify(postData.meta_keywords) : null,
        postData.status,
        postData.status === 'published' ? 1 : 0
      ],
      function (err) {
        if (err) {
          console.error('Error creating blog post:', err);
          logAIActivity(
            aiKey.id,
            'create_post',
            'blog_post',
            null,
            req.body,
            { error: err.message },
            'error',
            err.message,
            req
          );
          return res.status(500).json({ error: 'Failed to create blog post' });
        }

        const postId = this.lastID;

        // Add tags
        if (postData.tags && postData.tags.length > 0) {
          postData.tags.forEach((tagSlug: string) => {
            db.get(`SELECT id FROM blog_tags WHERE slug = ?`, [tagSlug], (err, tag: any) => {
              if (!err && tag) {
                db.run(
                  `INSERT OR IGNORE INTO blog_post_tags (post_id, tag_id) VALUES (?, ?)`,
                  [postId, tag.id]
                );
              } else {
                // Create tag
                db.run(
                  `INSERT INTO blog_tags (slug, name_en, name_fa) VALUES (?, ?, ?)`,
                  [tagSlug, tagSlug, tagSlug],
                  function (err) {
                    if (!err) {
                      db.run(
                        `INSERT INTO blog_post_tags (post_id, tag_id) VALUES (?, ?)`,
                        [postId, this.lastID]
                      );
                    }
                  }
                );
              }
            });
          });
        }

        const response = { success: true, id: postId, slug: postData.slug };

        logAIActivity(
          aiKey.id,
          'create_post',
          'blog_post',
          postId,
          req.body,
          response,
          'success',
          null,
          req
        );

        res.json(response);
      }
    );
  } catch (error: any) {
    logAIActivity(
      aiKey.id,
      'create_post',
      'blog_post',
      null,
      req.body,
      { error: error.message },
      'error',
      error.message,
      req
    );
    res.status(500).json({ error: error.message });
  }
};

// AI Update Blog Post
export const aiUpdateBlogPost: RequestHandler = (req, res) => {
  const aiKey = (req as any).aiKey;
  const { id } = req.params;
  const updateData = req.body;

  // Check permissions
  const permissions = aiKey.permissions ? JSON.parse(aiKey.permissions) : [];
  if (permissions.length > 0 && !permissions.includes('update_post')) {
    logAIActivity(
      aiKey.id,
      'update_post',
      'blog_post',
      parseInt(id),
      req.body,
      { error: 'Permission denied' },
      'error',
      'Permission denied: update_post',
      req
    );
    return res.status(403).json({ error: 'Permission denied' });
  }

  // Build update query (similar to updateBlogPost in blog.ts)
  const allowedFields = [
    'title_en', 'title_fa', 'content_en', 'content_fa', 'summary_en', 'summary_fa',
    'featured_image', 'meta_description_en', 'meta_description_fa', 'meta_keywords',
    'status', 'tags'
  ];

  const updates: string[] = [];
  const values: any[] = [];

  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      if (field === 'meta_keywords' && Array.isArray(updateData[field])) {
        updates.push(`${field} = ?`);
        values.push(JSON.stringify(updateData[field]));
      } else {
        updates.push(`${field} = ?`);
        values.push(updateData[field]);
      }
    }
  });

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  updates.push('updated_date = CURRENT_TIMESTAMP');

  if (updateData.status) {
    updates.push('is_published = ?');
    values.push(updateData.status === 'published' ? 1 : 0);
  }

  values.push(id);

  db.run(
    `UPDATE blog_posts SET ${updates.join(', ')} WHERE id = ?`,
    values,
    function (err) {
      if (err) {
        logAIActivity(
          aiKey.id,
          'update_post',
          'blog_post',
          parseInt(id),
          req.body,
          { error: err.message },
          'error',
          err.message,
          req
        );
        return res.status(500).json({ error: 'Failed to update blog post' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Blog post not found' });
      }

      const response = { success: true, id: parseInt(id) };

      logAIActivity(
        aiKey.id,
        'update_post',
        'blog_post',
        parseInt(id),
        req.body,
        response,
        'success',
        null,
        req
      );

      res.json(response);
    }
  );
};

// Get AI API keys (admin only)
export const getAIKeys: RequestHandler = (req, res) => {
  db.all(
    `SELECT id, name, provider, is_active, last_used_at, usage_count, rate_limit, created_at
     FROM ai_api_keys
     ORDER BY created_at DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Error fetching AI keys:', err);
        return res.status(500).json({ error: 'Failed to fetch AI keys' });
      }

      res.json(rows);
    }
  );
};

// Create AI API key (admin only)
export const createAIKey: RequestHandler = (req, res) => {
  const { name, provider, permissions, rate_limit } = req.body;

  if (!name || !provider) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Generate API key
  const apiKey = `ai_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

  db.run(
    `INSERT INTO ai_api_keys (name, api_key, provider, permissions, rate_limit)
     VALUES (?, ?, ?, ?, ?)`,
    [
      name,
      apiKey,
      provider,
      permissions ? JSON.stringify(permissions) : null,
      rate_limit || 100
    ],
    function (err) {
      if (err) {
        console.error('Error creating AI key:', err);
        return res.status(500).json({ error: 'Failed to create AI key' });
      }

      res.json({
        success: true,
        id: this.lastID,
        api_key: apiKey // Only return once
      });
    }
  );
};

// Get AI activity log (admin only)
export const getAIActivityLog: RequestHandler = (req, res) => {
  const { limit = 100, offset = 0 } = req.query;

  db.all(
    `SELECT 
      al.*,
      ak.name as api_key_name,
      ak.provider
    FROM ai_activity_log al
    LEFT JOIN ai_api_keys ak ON al.api_key_id = ak.id
    ORDER BY al.created_at DESC
    LIMIT ? OFFSET ?`,
    [parseInt(limit as string), parseInt(offset as string)],
    (err, rows) => {
      if (err) {
        console.error('Error fetching activity log:', err);
        return res.status(500).json({ error: 'Failed to fetch activity log' });
      }

      res.json(rows);
    }
  );
};

