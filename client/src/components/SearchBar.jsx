import { useState } from 'react';
import styled from "styled-components";

const SearchContainer = styled.div`
    width: 100%;
    max-width: ${props => props.$isExpanded ? '100vw' : '800px'};
    margin: 2rem auto;
    padding: ${props => props.$isExpanded ? '0 20px' : '0'};
    display: flex;
    align-items: center;
    position: relative;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

    div {
        width: 100%;
        position: relative;
        color: white;
    }

    input {
        width: 100%;
        border-radius: 12px;
        font-size: 18px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-bottom: ${props => props.$isExpanded ? '2px solid var(--cinema-gold)' : '2px solid rgba(255, 255, 255, 0.2)'};
        padding: 16px 20px;
        padding-right: 50px;
        color: white;
        background: rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        outline: none;
        font-weight: 400;
        line-height: 1.4;
        box-shadow: ${props => props.$isExpanded ? '0 2px 8px rgba(255, 215, 0, 0.15)' : 'none'};

        &::placeholder {
            color: rgba(255, 255, 255, 0.6);
            font-size: 18px;
            font-weight: 400;
        }

        &:not(:placeholder-shown) {
            font-size: clamp(1.5rem, 4vw, 2.5rem);
            font-weight: 600;
            line-height: 1.2;
            padding: 20px 24px;
            padding-right: 60px;
        }

        &:focus {
            border-color: var(--cinema-gold);
            border-bottom: 2px solid var(--cinema-gold);
            background: rgba(0, 0, 0, 0.5);
            box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2), ${props => props.$isExpanded ? '0 2px 8px rgba(255, 215, 0, 0.15)' : 'none'};
        }

        &:hover {
            border-color: rgba(255, 255, 255, 0.4);
            background: rgba(0, 0, 0, 0.4);
        }
    }

    span {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;
        color: rgba(255, 255, 255, 0.7);
        font-size: 16px;
        transition: all 0.2s ease;
        padding: 4px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;

        &:hover {
            color: white;
            background: rgba(255, 255, 255, 0.1);
        }
    }

    input:not(:placeholder-shown) + span {
        font-size: clamp(1.2rem, 3vw, 1.8rem);
        padding: 8px;
        width: 40px;
        height: 40px;
        right: 20px;
    }

    @media (max-width: 768px) {
        margin: 1.5rem auto;
        padding: 0 1rem;
        
        input {
            font-size: 16px;
            padding: 14px 18px;
            padding-right: 45px;
            
            &::placeholder {
                font-size: 16px;
            }

            &:not(:placeholder-shown) {
                font-size: clamp(1.2rem, 5vw, 1.8rem);
                font-weight: 600;
                line-height: 1.2;
                padding: 16px 20px;
                padding-right: 50px;
            }
        }
        
        span {
            right: 14px;
            font-size: 14px;
            width: 20px;
            height: 20px;
            padding: 2px;
        }

        input:not(:placeholder-shown) + span {
            font-size: clamp(1rem, 4vw, 1.4rem);
            width: 36px;
            height: 36px;
            padding: 8px;
            right: 16px;
        }
    }
`

const SearchBar = ({enterSearch, placeholder = "Search movies..."}) => {
    const [searchInput, setSearchInput] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    
    const handleChangeSearch = (event) => {
        setSearchInput(event.target.value);
    }

    const handleClearSearch = () => {
        setSearchInput('');
        enterSearch('');
        setIsExpanded(false);
    }

    const handleKeyDown = (event) => {
        // Check if "Enter" key is pressed
        if (event.key === 'Enter') {
            enterSearch(searchInput);
        }
    };

    const handleFocus = () => {
        setIsExpanded(true);
    };

    const handleBlur = () => {
        // Small delay to allow for clicking on clear button
        setTimeout(() => {
            setIsExpanded(false);
        }, 200);
    };

    return (
        <SearchContainer $isExpanded={isExpanded} className="search-bar">
            <div>
                <input 
                    value={searchInput}
                    type="text"
                    id="search"
                    placeholder={placeholder}
                    onChange={handleChangeSearch}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
                <span onClick={handleClearSearch}>✖</span>
            </div>
        </SearchContainer>
    );
}

export default SearchBar;