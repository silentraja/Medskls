// src/components/AddFavoriteForm.js
import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  CardMedia,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../Context/AuthContext';
import { favoritesAPI } from '../Api/api';

const AddFavoriteForm = () => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    bookId: '',
    title: '',
    author: '',
    coverImageUrl: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('Please login to add favorites');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      
      await favoritesAPI.addFavorite(formData);
      
      setSuccess(true);
      setFormData({
        bookId: '',
        title: '',
        author: '',
        coverImageUrl: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Add New Favorite Book
      </Typography>
      
      {!isAuthenticated && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You need to login to add favorite books
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Book added to favorites successfully!
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Book ID"
          name="bookId"
          value={formData.bookId}
          onChange={handleChange}
          required
          margin="normal"
          disabled={!isAuthenticated || isLoading}
        />
        
        <TextField
          fullWidth
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          margin="normal"
          disabled={!isAuthenticated || isLoading}
        />
        
        <TextField
          fullWidth
          label="Author"
          name="author"
          value={formData.author}
          onChange={handleChange}
          required
          margin="normal"
          disabled={!isAuthenticated || isLoading}
        />
        
        <TextField
          fullWidth
          label="Cover Image URL"
          name="coverImageUrl"
          value={formData.coverImageUrl}
          onChange={handleChange}
          margin="normal"
          disabled={!isAuthenticated || isLoading}
        />
        
        {formData.coverImageUrl && (
          <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
            <CardMedia
              component="img"
              sx={{ maxHeight: 200, maxWidth: 150, objectFit: 'contain' }}
              image={formData.coverImageUrl}
              alt="Book cover preview"
            />
          </Box>
        )}

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!isAuthenticated || isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Add to Favorites'}
          </Button>
        </Box>
      </form>
    </Card>
  );
};

export default AddFavoriteForm;