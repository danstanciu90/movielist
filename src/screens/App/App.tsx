import React, { useEffect, useState, MouseEvent } from 'react';
import { getMovieById, getAllMovies } from '../../api';
import MaterialTable, { Action, Column } from 'material-table';
import moment from 'moment';
import { calculateAvailability } from '../../utils';
import { MovieDetail } from '../../components/MovieDetail';
import { Container } from '@material-ui/core';

const jsonMovies = require('../../movies.json');

export interface IDBMovie {
  imdbid: string;
  excitement?: number;
}

export interface IDetailedMovie {
  title: string;
  rating: number;
  year: number;
  released: Date;
  releasedFmt: string;
  poster: string;
  dvd?: string;
  actors: string;
  genres: string;
  plot: string;
  ready: boolean;
  imdbid: string;
}

const width = window.innerWidth;

export const App: React.FC = () => {
  const [movies, setMovies] = useState<IDetailedMovie[]>([]);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    getAllMovies().then((res: IDBMovie[]) => {
      res.forEach(async (movie: IDBMovie, index: number) => {
        try {
          const detailedMovie: IDetailedMovie = await getMovieById(movie.imdbid);
          detailedMovie.releasedFmt = moment(detailedMovie.released).format('DD/MM/YYYY')
          detailedMovie.ready = calculateAvailability(detailedMovie)
          setMovies(prev => [...prev, detailedMovie])
          if (index === jsonMovies.length - 1) {
            setPageReady(true)
          }
        }
        catch (err) {
          console.log(`error getting the details for the movie id ${movie.imdbid}`)
        }
      });
    })
  }, [])




  const deleteMovie = (movie: IDetailedMovie | IDetailedMovie[]) => {
    if (movie instanceof Array) {
      return;
    }
    const remaining: IDetailedMovie[] = movies.filter(m => m.imdbid !== movie.imdbid)
    setMovies(remaining)
  }

  const handleRowClick = (_event: MouseEvent | undefined, _rowData: IDetailedMovie | undefined, togglePanel: ((panelIndex?: number) => void) | undefined) => {
    if (!togglePanel) {
      return;
    }
    togglePanel()
  }

  const renderDetailPanel = (rowData: IDetailedMovie) => {
    return <MovieDetail movie={rowData} />
  }

  const tableActions: (Action<IDetailedMovie> | ((rowData: IDetailedMovie) => Action<IDetailedMovie>))[] = [
    {
      icon: 'delete',
      iconProps: { color: 'error' },
      tooltip: 'Delete',
      onClick: (_event, rowData) => deleteMovie(rowData)
    }
  ]

  const tableColumns: Column<IDetailedMovie>[] = [
    { title: 'Title', field: 'title' },
    { title: 'Release  Date', field: 'releasedFmt', customSort: (a, b) => a.released.getTime() - b.released.getTime() },
    { title: 'Rating', field: 'rating', type: 'numeric' },
    { title: 'FL Ready', field: 'ready', lookup: { true: 'Yes', false: 'No' } }
  ]

  return (
    <Container maxWidth={width > 1000 ? 'xl' : 'xs'}>
      <MaterialTable
        columns={tableColumns}
        data={movies}
        options={{ paging: false, detailPanelType: 'single' }}
        isLoading={!pageReady}
        title="Movies To Watch"
        actions={tableActions}
        detailPanel={renderDetailPanel}
        onRowClick={handleRowClick}
      />
    </Container>
  );
}