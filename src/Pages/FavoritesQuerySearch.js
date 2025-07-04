
import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  CardMedia, 
  CircularProgress,
  Box,
  Alert,
  Button
} from '@mui/material';
import { Favorite, Search } from '@mui/icons-material';
import { useAuth } from '../Context/AuthContext';
import { favoritesAPI } from '../Api/api';

const FavoritesQuerySearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Search with debounce
  useEffect(() => {
    const searchFavorites = async () => {
      if (query.trim() && isAuthenticated) {
        try {
          setIsLoading(true);
          setError(null);
          const response = await favoritesAPI.searchFavorites(query);
          setResults(response.data); // Access the data property
        } catch (err) {
          setError(err.response?.data?.message || err.message);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    const timerId = setTimeout(searchFavorites, 300);
    return () => clearTimeout(timerId);
  }, [query, isAuthenticated]);
  const handleRemoveFavorite = async (bookId) => {
    try {
      await favoritesAPI.removeFavorite(bookId);
      setResults(results.filter(book => book.bookId !== bookId));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <TextField
        fullWidth
        variant="outlined"
        label="Search favorites by title or author"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        disabled={!isAuthenticated}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: <Search sx={{ color: 'action.active', mr: 1 }} />,
        }}
      />

      {!isAuthenticated && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Please login to search your favorite books
        </Alert>
      )}

      {isLoading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {isAuthenticated && !isLoading && results.length === 0 && query && (
        <Typography variant="h6" textAlign="center" sx={{ my: 4 }}>
          No matching favorites found
        </Typography>
      )}

      <Grid container spacing={3}>
        {results.map((book) => (
          <Grid item xs={12} sm={6} md={4} key={book.bookId}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {book.coverImageUrl && (
                <CardMedia
                  component="img"
                  height="200"
                  image={book.coverImageUrl}
                  alt={book.title}
                  sx={{ objectFit: 'contain', bgcolor: 'grey.100' }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div">
                  {book.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {book.author}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="error"
                  startIcon={<Favorite />}
                  onClick={() => handleRemoveFavorite(book.bookId)}
                >
                  Remove
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FavoritesQuerySearch;