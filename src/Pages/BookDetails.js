// pages/BookDetails.js
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBooks } from '../Context/BookContext';
import { 
  Box, Typography, Container, Card, CardContent, 
  CardMedia, Button, CircularProgress, Alert 
} from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';

const BookDetails = () => {
  const { id } = useParams();
  const { selectedBook, loading, error, getBookDetails, favorites, addFavorite, removeFavorite } = useBooks();

  useEffect(() => {
    if (id) {
      getBookDetails(id);
    }
  }, [id, getBookDetails]);

  const isFavorite = (bookId) => {
    return favorites.some(fav => fav.bookId === bookId);
  };

  const handleToggleFavorite = async () => {
    if (isFavorite(selectedBook.id)) {
      const favorite = favorites.find(fav => fav.bookId === selectedBook.id);
      await removeFavorite(favorite.id);
    } else {
      await addFavorite({
        bookId: selectedBook.id,
        title: selectedBook.title,
        author: selectedBook.author,
        coverImageUrl: selectedBook.coverImageUrl
      });
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!selectedBook) return <Typography>Book not found</Typography>;

  return (
    <Container maxWidth="md">
      <Button component={Link} to="/search" variant="outlined" sx={{ mb: 2 }}>
        Back to Search
      </Button>
      
      <Card>
        {selectedBook.coverImageUrl && (
          <CardMedia
            component="img"
            height="400"
            image={selectedBook.coverImageUrl}
            alt={selectedBook.title}
          />
        )}
        <CardContent>
          <Typography gutterBottom variant="h3" component="div">
            {selectedBook.title}
          </Typography>
          <Typography variant="h5" color="text.secondary">
            by {selectedBook.author}
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" paragraph>
              {selectedBook.description || 'No description available'}
            </Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            {selectedBook.publisher && (
              <Typography variant="subtitle1">
                <strong>Publisher:</strong> {selectedBook.publisher}
              </Typography>
            )}
            {selectedBook.publishedDate && (
              <Typography variant="subtitle1">
                <strong>Published:</strong> {new Date(selectedBook.publishedDate).toLocaleDateString()}
              </Typography>
            )}
            {selectedBook.isbn && (
              <Typography variant="subtitle1">
                <strong>ISBN:</strong> {selectedBook.isbn}
              </Typography>
            )}
          </Box>

          <Button
            variant="contained"
            startIcon={isFavorite(selectedBook.id) ? <Favorite /> : <FavoriteBorder />}
            onClick={handleToggleFavorite}
            sx={{ mt: 3 }}
          >
            {isFavorite(selectedBook.id) ? 'Remove Favorite' : 'Add Favorite'}
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default BookDetails;