import { firebase } from '../utils/firebase';
import { IDBMovie } from '../screens/MovieList';

const imdb = require('imdb-api')
const imdbClient = new imdb.Client({ apiKey: '50ca2246' });
const moviesdb = firebase.firestore().collection('movies')

export const getMovieById = async (movieId: string) => {
  return await imdbClient.get({ id: movieId })
}

export const getAllMovies = async () => {
  try {
    const snapshot = await moviesdb.get()
    const movies = snapshot.docs.map(doc => doc.data())

    return movies as IDBMovie[];
  } catch (error) {
    throw error;
  }
}

export const addMovie = async (imdbid: string) => {
  try {
    await moviesdb.add({
      imdbid
    })
  } catch (error) {
    throw error;
  }
}

export const deleteMovie = async (imdbid: string) => {
  try {
    const moviesQuery = moviesdb.where('imdbid', '==', imdbid)
    const snapshot = await moviesQuery.get()
    snapshot.forEach(async (item) => {
      await item.ref.delete()
    })
    return 'ok'
  } catch (error) {
    throw error;
  }
}

export const searchMovie = async (title: string) => {
  try {
    const response = await imdbClient.search({ 'name': title });
    return response.results
  } catch (error) {
    throw error;
  }
}