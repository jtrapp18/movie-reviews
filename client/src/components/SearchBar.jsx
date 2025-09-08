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
    }

    input {
        width: 100%;
        border-radius: 20px;
        font-size: 16px;
        border: 1px solid #ccc;
        padding: 10px 15px;
        color: black;

        &:hover {
            background: var(--cinema-gold);
        }
    }

    span {
        position: absolute;
        right: 5%;
        top: 50%;
        transform: translateY(-50%);
        color: black;
        cursor: pointer;
    }

`

const SearchBar = ({enterSearch, placeholder = "Search movies..."}) => {
    console.log('SearchBar rendered with placeholder:', placeholder);
    const [searchInput, setSearchInput] = useState('');
    
    const handleChangeSearch = (event) => {
        setSearchInput(event.target.value);
    }

    const handleClearSearch = () => {
        setSearchInput('');
        enterSearch('');
    }

    const handeKeyDown = (event) => {
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
                    onKeyDown={handeKeyDown}
                />
                <span onClick={handleClearSearch}>✖</span>
            </div>
        </SearchContainer>
    );
}

export default SearchBar;