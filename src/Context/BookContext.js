import { createContext, useCallback, useContext, useState } from 'react';
import { bookAPI, favoritesAPI } from '../Api/api';

const BookContext = createContext();

export const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  const getBookDetail = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await bookAPI.getById(id);
      setSelectedBook(response.data);
      setError(null);
      return { success: true, data: response.data };
    } catch (err) {
      setSelectedBook(null);
      setError(err.response?.data || 'Failed to fetch book details');
      return { success: false, error: err.response?.data || err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const getFavoriteBook = useCallback(async (id) => {
    setLoading(true);
    try {
      const response = await favoritesAPI.getFavoriteBook(id);
      setError(null);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.title || 
                          err.response?.data?.detail || 
                          err.message || 
                          'Failed to fetch favorite book';
      setError(errorMessage); 
      throw new Error(errorMessage); 
    } finally {
      setLoading(false);
    }
  }, []);

  const searchBooks = async (query) => {
    setLoading(true);
    try {
      const response = await bookAPI.search(query);
      setBooks(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFavorites = async () => {
    setLoading(true);
    try {
      const response = await favoritesAPI.getFavorites();
      setFavorites(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = useCallback(async (book) => {
    try {
      const response = await favoritesAPI.addFavorite(book);
      setFavorites(prev => [...prev, response.data]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data || err.message };
    }
  }, []);
  
  const removeFavorite = useCallback(async (bookId) => { 
    try {
      await favoritesAPI.removeFavorite(bookId);  
      setFavorites(prev => prev.filter(book => book.bookId !== bookId));  
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data || err.message };
    }
  }, []);

  return (
    <BookContext.Provider
      value={{
        books,
        favorites,
        loading,
        error,
        selectedBook,
        searchBooks,
        getFavorites,
        addFavorite,
        removeFavorite,
        getBookDetail,
        getFavoriteBook
      }}
    >
      {children}
    </BookContext.Provider>
  );
};

export const useBooks = () => useContext(BookContext);