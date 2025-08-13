
import { Router } from 'express';
import { authorityDetails } from '../config/authorityMap.js';

const router = Router();

// Get all authorities
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: authorityDetails
    });
  } catch (error) {
    console.error('Failed to get authorities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get authorities'
    });
  }
});

// Get authority by category
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const relevantAuthorities = Object.entries(authorityDetails)
      .filter(([_, details]) => details.categories.includes(category))
      .reduce((acc, [name, details]) => {
        acc[name] = details;
        return acc;
      }, {} as typeof authorityDetails);

    res.json({
      success: true,
      category,
      data: relevantAuthorities
    });
  } catch (error) {
    console.error('Failed to get authorities by category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get authorities by category'
    });
  }
});

export default router;
