import React, { useState } from "react";

function SearchBar({ onSearch }) {
  const [input, setInput] = useState("");

  // Function Handlers
  const handleInputChange = ({ target }) => {
    setInput(target.value);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    onSearch(input);
    setInput("");
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSearch}>
        <input
          className="search-input"
          type="text"
          placeholder="Enter a Song or an Artist"
          onChange={handleInputChange}
          value={input}
          maxLength={50}
        />
        <button className="search-button" type="submit">
          Search
        </button>
      </form>
    </div>
  );
}

export default SearchBar;
