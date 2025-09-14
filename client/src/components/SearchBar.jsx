import { useState } from 'react';
import styled from "styled-components";

const SearchContainer = styled.div`
    max-height: 100px;
    width: min(500px, 90vw);
    margin: 2% auto;
    display: flex;
    align-items: center;

    div {
        width: 100%;
        height: 100%;
        position: relative;
        color: white;

        &:hover {
            color: black;
        }
    }

    input {
        width: 100%;
        border-radius: 20px;
        font-size: 16px;
        border: 1px solid #ccc;
        padding: 10px 15px;
        color: inherit;

        &:hover {
            background: var(--cinema-gold);
        }
    }

    span {
        position: absolute;
        right: 5%;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
        color: inherit;
    }

`

const SearchBar = ({enterSearch, placeholder = "Search movies..."}) => {
    const [searchInput, setSearchInput] = useState('');
    
    const handleChangeSearch = (event) => {
        setSearchInput(event.target.value);
    }

    const handleClearSearch = () => {
        setSearchInput('');
        enterSearch('');
    }

    const handleKeyDown = (event) => {
        // Check if "Enter" key is pressed
        if (event.key === 'Enter') {
            enterSearch(searchInput);
        }
    };

    return (
        <SearchContainer className="search-bar">
            <div>
                <input 
                    value={searchInput}
                    type="text"
                    id="search"
                    placeholder={placeholder}
                    onChange={handleChangeSearch}
                    onKeyDown={handleKeyDown}
                />
                <span onClick={handleClearSearch}>✖</span>
            </div>
        </SearchContainer>
    );
}

export default SearchBar;