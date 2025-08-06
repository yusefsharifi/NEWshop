import { RequestHandler } from "express";

export const handlePlaceholder: RequestHandler = (req, res) => {
  const { width = '400', height = '300' } = req.params;
  
  // Redirect to a placeholder image service
  const placeholderUrl = `https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=${width}&h=${height}&fit=crop&crop=center`;
  
  res.redirect(placeholderUrl);
};
