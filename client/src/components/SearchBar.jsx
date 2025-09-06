import { useState } from 'react';
import styled from "styled-components";

const SearchContainer = styled.div`
    height: 45px;
    width: min(500px, 90vw);
    padding: 1vh 0 1vh 0;
    margin: 5% auto;

    div {
        width: 100%;
        height: 45px;
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
            background: var(--yellow);
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

    .search-button {
        position: absolute;
        right: 15%;
        top: 50%;
        transform: translateY(-50%);
        color: black;
        cursor: pointer;
        background: var(--yellow);
        padding: 5px 15px;
        border-radius: 15px;
        font-weight: bold;
        border: 1px solid #ccc;
        
        &:hover {
            background: var(--dark-yellow);
        }
    }
`

const SearchBar = ({enterSearch}) => {

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
        <SearchContainer >
            <div>
                <input 
                    value={searchInput}
                    type="text"
                    id="search"
                    placeholder="Search movies..."
                    onChange={handleChangeSearch}
                    onKeyDown={handeKeyDown}
                />
                <span onClick={handleClearSearch}>✖</span>
                <span className="search-button" onClick={()=>enterSearch(searchInput)}>ENTER</span>
            </div>
        </SearchContainer>
    );
}

export default SearchBar;