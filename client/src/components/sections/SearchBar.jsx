import { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

/** Hero search + left accessory (Library / Discover). DOM order: input column first, leading second — mobile column shows search on top; desktop row-reverse puts the pill on the left. */
const HeroCombinedShell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  align-items: stretch;

  @media (min-width: 769px) {
    flex-direction: row-reverse;
    align-items: stretch;
    gap: 0;
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(20, 22, 28, 0.55);
    backdrop-filter: blur(10px);
    overflow: hidden;
  }
`;

const LeadingSlot = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media (min-width: 769px) {
    padding: 4px 8px 4px 10px;
    border-right: 1px solid rgba(255, 255, 255, 0.2);
    align-self: stretch;
  }
`;

const InputWrap = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
  width: 100%;
`;

const SearchContainer = styled.div`
  width: 100%;
  max-width: ${(props) => (props.$isExpanded ? '100vw' : '800px')};
  margin: 1rem auto 2rem auto;
  padding: ${(props) => (props.$isExpanded ? '0 20px' : '0')};
  display: flex;
  align-items: center;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  ${({ $variant }) =>
    $variant === 'hero' &&
    css`
      margin: 0 auto 0.5rem;
      max-width: min(100%, 800px);
    `}

  div {
    width: 100%;
    position: relative;
  }

  input:not(.hero-combined-input) {
    width: 100%;
    border-radius: 12px;
    font-size: 18px;
    border: 1px solid var(--border);
    padding: 16px 20px;
    padding-right: 50px;
    background: var(--background-secondary);
    backdrop-filter: blur(10px);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    outline: none;
    font-weight: 400;
    line-height: 1.4;
    box-shadow: ${(props) =>
      props.$isExpanded ? '0 2px 8px rgba(255, 215, 0, 0.15)' : 'none'};

    &::placeholder {
      color: var(--secondary);
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
      border-color: var(--border);
      border-bottom: 2px solid var(--border);
      box-shadow:
        0 0 0 3px rgba(255, 215, 0, 0.2),
        ${(props) =>
          props.$isExpanded ? '0 2px 8px rgba(255, 215, 0, 0.15)' : 'none'};
    }

    &:hover {
      color: var(--font-color-2);
      background: var(--background-tertiary);
    }
  }

  span {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: var(--font-color-2);
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
      color: var(--font-color-1);
      background: var(--background-tertiary);
    }
  }

  input:not(.hero-combined-input):not(:placeholder-shown) + span {
    font-size: clamp(1.2rem, 3vw, 1.8rem);
    padding: 8px;
    width: 40px;
    height: 40px;
    right: 20px;
  }

  ${({ $variant, $hasHeroAccessory }) =>
    $variant === 'hero' &&
    !$hasHeroAccessory &&
    css`
      input:not(.hero-combined-input) {
        border-radius: 9999px;
        padding: 14px 22px;
        padding-right: 48px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        background: rgba(20, 22, 28, 0.55);
        backdrop-filter: blur(10px);
        color: var(--soft-white);
        font-size: 0.95rem;
        box-shadow: none;

        &::placeholder {
          color: rgba(248, 249, 250, 0.55);
          font-size: 0.95rem;
        }

        &:not(:placeholder-shown) {
          font-size: 1rem;
          font-weight: 500;
          padding: 14px 22px;
          padding-right: 48px;
          background: rgba(228, 226, 218, 0.94);
          color: #1a1d26;
          -webkit-text-fill-color: #1a1d26;
          caret-color: #1a1d26;
          border-color: rgba(32, 36, 44, 0.22);
        }

        &:not(:placeholder-shown):hover {
          background: rgba(222, 219, 210, 0.96);
          color: #12151c;
          -webkit-text-fill-color: #12151c;
        }

        &:not(:placeholder-shown):focus {
          border-color: rgba(32, 36, 44, 0.35);
          border-bottom: 1px solid rgba(32, 36, 44, 0.35);
          box-shadow: 0 0 0 2px rgba(32, 36, 44, 0.12);
        }

        &:hover:not(:placeholder-shown) {
          color: #12151c;
          -webkit-text-fill-color: #12151c;
        }

        &:hover:placeholder-shown {
          color: var(--soft-white);
          background: rgba(28, 30, 38, 0.65);
        }

        &:focus:placeholder-shown {
          border-color: rgba(255, 255, 255, 0.35);
          border-bottom: 1px solid rgba(255, 255, 255, 0.35);
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.08);
        }
      }

      span {
        color: rgba(248, 249, 250, 0.75);
      }

      input:not(.hero-combined-input):not(:placeholder-shown) + span {
        font-size: 1rem;
        padding: 0;
        width: 28px;
        height: 28px;
        right: 16px;
        color: rgba(38, 42, 52, 0.65);

        &:hover {
          color: rgba(22, 24, 32, 0.95);
          background: rgba(0, 0, 0, 0.07);
        }
      }
    `}

  ${HeroCombinedShell} {
    input.hero-combined-input {
      width: 100%;
      border-radius: 9999px;
      padding: 14px 22px;
      padding-right: 48px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(20, 22, 28, 0.55);
      backdrop-filter: blur(10px);
      color: var(--soft-white);
      font-size: 0.95rem;
      box-shadow: none;
      outline: none;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      font-weight: 400;
      line-height: 1.4;

      &::placeholder {
        color: rgba(248, 249, 250, 0.55);
        font-size: 0.95rem;
      }

      &:not(:placeholder-shown) {
        font-size: 1rem;
        font-weight: 500;
        padding: 14px 22px;
        padding-right: 48px;
        background: rgba(228, 226, 218, 0.94);
        color: #1a1d26;
        -webkit-text-fill-color: #1a1d26;
        caret-color: #1a1d26;
        border-color: rgba(32, 36, 44, 0.22);
      }

      &:not(:placeholder-shown):hover {
        background: rgba(222, 219, 210, 0.96);
        color: #12151c;
        -webkit-text-fill-color: #12151c;
      }

      &:not(:placeholder-shown):focus {
        border-color: rgba(32, 36, 44, 0.35);
        border-bottom: 1px solid rgba(32, 36, 44, 0.35);
        box-shadow: 0 0 0 2px rgba(32, 36, 44, 0.12);
      }

      &:hover:not(:placeholder-shown) {
        color: #12151c;
        -webkit-text-fill-color: #12151c;
      }

      &:hover:placeholder-shown {
        color: var(--soft-white);
        background: rgba(28, 30, 38, 0.65);
      }

      &:focus:placeholder-shown {
        border-color: rgba(255, 255, 255, 0.35);
        border-bottom: 1px solid rgba(255, 255, 255, 0.35);
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.08);
      }

      @media (min-width: 769px) {
        border: none;
        border-radius: 0;
        background: transparent;
        backdrop-filter: none;
        box-shadow: none;

        &::placeholder {
          color: rgba(248, 249, 250, 0.55);
        }

        &:not(:placeholder-shown) {
          background: rgba(228, 226, 218, 0.94);
        }

        &:not(:placeholder-shown):hover {
          background: rgba(222, 219, 210, 0.96);
        }

        &:hover:placeholder-shown {
          background: transparent;
        }

        &:focus:placeholder-shown {
          box-shadow: none;
        }

        &:not(:placeholder-shown):focus {
          box-shadow: none;
        }
      }
    }

    span {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
      font-size: 16px;
      transition: all 0.2s ease;
      padding: 4px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      color: rgba(248, 249, 250, 0.75);

      &:hover {
        color: rgba(248, 249, 250, 0.95);
        background: rgba(255, 255, 255, 0.1);
      }
    }

    input.hero-combined-input:not(:placeholder-shown) + span {
      font-size: 1rem;
      padding: 0;
      width: 28px;
      height: 28px;
      right: 16px;
      color: rgba(38, 42, 52, 0.65);

      &:hover {
        color: rgba(22, 24, 32, 0.95);
        background: rgba(0, 0, 0, 0.07);
      }
    }
  }

  @media (max-width: 768px) {
    margin: 0.5rem auto 1.5rem;
    padding: 0 1rem;

    input:not(.hero-combined-input) {
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

    input:not(.hero-combined-input):not(:placeholder-shown) + span {
      font-size: clamp(1rem, 4vw, 1.4rem);
      width: 36px;
      height: 36px;
      padding: 8px;
      right: 16px;
    }

    ${({ $variant, $hasHeroAccessory }) =>
      $variant === 'hero' &&
      !$hasHeroAccessory &&
      css`
        margin: 0 auto 0.5rem;

        input:not(.hero-combined-input) {
          font-size: 0.9rem;
          padding: 0.85rem 1.1rem;
          padding-right: 2.75rem;

          &::placeholder {
            font-size: 0.9rem;
          }

          &:not(:placeholder-shown) {
            font-size: 0.95rem;
            font-weight: 500;
            line-height: 1.35;
            padding: 0.85rem 1.1rem;
            padding-right: 2.75rem;
            background: rgba(228, 226, 218, 0.94);
            color: #1a1d26;
            -webkit-text-fill-color: #1a1d26;
            caret-color: #1a1d26;
            border-color: rgba(32, 36, 44, 0.22);
          }
        }

        input:not(.hero-combined-input):not(:placeholder-shown) + span {
          font-size: 0.95rem;
          width: 26px;
          height: 26px;
          padding: 0;
          right: 14px;
          color: rgba(38, 42, 52, 0.65);

          &:hover {
            color: rgba(22, 24, 32, 0.95);
            background: rgba(0, 0, 0, 0.07);
          }
        }
      `}

    ${({ $variant, $hasHeroAccessory }) =>
      $variant === 'hero' &&
      $hasHeroAccessory &&
      css`
        margin: 0 auto 0.5rem;

        ${HeroCombinedShell} input.hero-combined-input {
          font-size: 0.9rem;
          padding: 0.85rem 1.1rem;
          padding-right: 2.75rem;

          &::placeholder {
            font-size: 0.9rem;
          }

          &:not(:placeholder-shown) {
            font-size: 0.95rem;
            font-weight: 500;
            line-height: 1.35;
            padding: 0.85rem 1.1rem;
            padding-right: 2.75rem;
            background: rgba(228, 226, 218, 0.94);
            color: #1a1d26;
            -webkit-text-fill-color: #1a1d26;
            caret-color: #1a1d26;
            border-color: rgba(32, 36, 44, 0.22);
          }
        }

        ${HeroCombinedShell} input.hero-combined-input:not(:placeholder-shown) + span {
          font-size: 0.95rem;
          width: 26px;
          height: 26px;
          padding: 0;
          right: 14px;
          color: rgba(38, 42, 52, 0.65);

          &:hover {
            color: rgba(22, 24, 32, 0.95);
            background: rgba(0, 0, 0, 0.07);
          }
        }
      `}
  }
`;

const SearchBar = ({
  enterSearch,
  placeholder = 'Search movies...',
  variant = 'default',
  value,
  onValueChange,
  accessory = null,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const isControlled = typeof value === 'string';
  const hasHeroAccessory = Boolean(accessory && variant === 'hero');

  useEffect(() => {
    if (isControlled) {
      setSearchInput(value);
    }
  }, [isControlled, value]);

  const handleChangeSearch = (event) => {
    const nextValue = event.target.value;
    if (!isControlled) {
      setSearchInput(nextValue);
    }
    onValueChange?.(nextValue);
  };

  const handleClearSearch = () => {
    if (!isControlled) {
      setSearchInput('');
    }
    onValueChange?.('');
    enterSearch('');
    setIsExpanded(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      const submittedValue = isControlled ? value : searchInput;
      enterSearch(submittedValue ?? '');
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsExpanded(false);
    }, 200);
  };

  const inputProps = {
    value: isControlled ? value : searchInput,
    type: 'text',
    id: 'search',
    placeholder,
    onChange: handleChangeSearch,
    onKeyDown: handleKeyDown,
    onFocus: handleFocus,
    onBlur: handleBlur,
    className: hasHeroAccessory ? 'hero-combined-input' : undefined,
  };

  const inputEl = <input {...inputProps} />;
  const clearEl = (
    <span onClick={handleClearSearch} role="presentation">
      ✖
    </span>
  );

  return (
    <SearchContainer
      $isExpanded={isExpanded}
      $variant={variant}
      $hasHeroAccessory={hasHeroAccessory}
      className="search-bar"
    >
      {hasHeroAccessory ? (
        <HeroCombinedShell>
          <InputWrap>
            {inputEl}
            {clearEl}
          </InputWrap>
          <LeadingSlot>{accessory}</LeadingSlot>
        </HeroCombinedShell>
      ) : (
        <div>
          {inputEl}
          {clearEl}
        </div>
      )}
    </SearchContainer>
  );
};

export default SearchBar;
