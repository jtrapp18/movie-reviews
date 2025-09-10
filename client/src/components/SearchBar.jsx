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
    console.log('SearchBar enterSearch function:', typeof enterSearch);
    const [searchInput, setSearchInput] = useState('');
    
    const handleChangeSearch = (event) => {
        setSearchInput(event.target.value);
    }

    const handleClearSearch = () => {
        setSearchInput('');
        enterSearch('');
    }

    const handleKeyDown = (event) => {
        console.log('🔍 Key pressed:', event.key);
        // Check if "Enter" key is pressed
        if (event.key === 'Enter') {
            console.log('🔍 Enter pressed, calling enterSearch with:', searchInput);
            console.log('🔍 enterSearch function:', enterSearch);
            try {
                enterSearch(searchInput);
                console.log('🔍 enterSearch called successfully');
            } catch (error) {
                console.error('🔍 Error calling enterSearch:', error);
            }
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