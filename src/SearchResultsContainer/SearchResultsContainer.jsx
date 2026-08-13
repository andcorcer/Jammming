import React from 'react';
import TrackList from '../TrackList/TrackList';

function SearchResultsContainer({ searchResults, onAdd }) {
  return (
    <div className="SearchResults">
      <h2>Results</h2>
      <TrackList 
        tracks={searchResults} 
        onAdd={onAdd} 
        isRemoval={false} 
      />
    </div>
  );
}

export default SearchResultsContainer;