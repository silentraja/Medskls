import { useState } from 'react';
import { 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Container, 
  Card, 
  CardContent, 
  CardActions, 
  CardMedia, 
  Alert,
  CircularProgress
} from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useBooks } from '../Context/BookContext';
import { useAuth } from '../Context/AuthContext';

const BookSearch = () => {
  const [bookId, setBookId] = useState('');
  const { 
    favorites, 
    loading, 
    error, 
    getFavoriteBook, // Use the new function
    addFavorite, 
    removeFavorite 
  } = useBooks();
  
  const [book, setBook] = useState(null);
  const { user } = useAuth();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (bookId.trim()) {
      try {
        const foundBook = await getFavoriteBook(bookId); // Now using getFavoriteBook
        setBook(foundBook);
      } catch (err) {
        console.error('API Error:', err);
        setBook(null);
      }
    }
  };

  const isFavorite = (id) => {
    return favorites.some(fav => fav.bookId === id.toString());
  };

  const toggleFavorite = async () => {
    if (!book) return;
    
    try {
      if (isFavorite(book.id)) {
        await removeFavorite(book.id.toString());
      } else {
        await addFavorite({
          bookId: book.id.toString(),
          title: book.title,
          author: book.author,
          coverImageUrl: book.coverImageUrl
        });
      }
      // Refresh the book data
      const updatedBook = await getFavoriteBook(book.id);
      setBook(updatedBook);
    } catch (err) {
      console.error('Favorite Error:', err);
    }
  };

  return (
    <Container>
      <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="Search favorite book by ID"
          variant="outlined"
          value={bookId}
          onChange={(e) => setBookId(e.target.value)}
          InputProps={{
            endAdornment: (
              <Button 
                type="submit" 
                variant="contained" 
                disabled={!bookId.trim() || loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Search'}
              </Button>
            )
          }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {book && (
        <Card sx={{ maxWidth: 345, mx: 'auto' }}>
          {book.coverImageUrl && (
            <CardMedia
              component="img"
              height="200"
              image={book.coverImageUrl}
              alt={book.title}
              sx={{ objectFit: 'contain' }}
            />
          )}
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {book.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {book.author}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              ID: {book.id}
            </Typography>
          </CardContent>
          <CardActions>
            <Button 
              size="small" 
              startIcon={isFavorite(book.id) ? <Favorite color="error" /> : <FavoriteBorder />}
              onClick={toggleFavorite}
              color={isFavorite(book.id) ? 'error' : 'primary'}
              disabled={loading}
            >
              {isFavorite(book.id) ? 'Remove Favorite' : 'Add Favorite'}
            </Button>
          </CardActions>
        </Card>
      )}

      {!book && bookId && !loading && (
        <Typography variant="body1" textAlign="center" sx={{ mt: 2 }}>
        </Typography>
      )}
    </Container>
  );
};

export default BookSearch;