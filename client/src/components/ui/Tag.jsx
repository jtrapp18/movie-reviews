import styled from 'styled-components';
import { CHIP_VARIANT_ZOOM } from '@styles/chipVariants';

const TagContainer = styled.div`
  display: inline-flex;
  align-items: center;
  background-color: ${(props) => props.backgroundColor};
  color: ${(props) => props.textColor};
  padding: ${(props) => (props.size === 'small' ? '2px 6px' : '4px 12px')};
  border-radius: ${(props) => (props.size === 'small' ? '12px' : '20px')};
  font-size: ${(props) => (props.size === 'small' ? '0.7rem' : '0.85rem')};
  font-weight: ${(props) => (props.$variant === 'zoom' ? 600 : 500)};
  margin: 2px;
  cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};
  transition: all 0.2s ease;
  border: 1px solid ${(props) => props.borderColor || 'transparent'};
  height: ${(props) => (props.size === 'small' ? '20px' : '28px')};
  line-height: 1;
  white-space: nowrap;

  &:hover {
    ${(props) =>
      props.clickable &&
      `
      transform: translateY(-1px);
      ${props.$variant === 'zoom' ? '' : 'box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);'}
    `}
  }

  .tag-remove {
    margin-left: 6px;
    color: ${(props) => props.textColor};
    cursor: pointer;

    &:hover {
      opacity: 1;
    }
  }
`;

const Tag = ({
  children,
  /** 'default' (blue pill) | 'zoom' — same palette as ZoomControls */
  variant = 'default',
  backgroundColor,
  textColor,
  borderColor,
  clickable = false,
  onRemove,
  onClick,
  size = 'normal',
  ...props
}) => {
  const resolved =
    variant === 'zoom'
      ? {
          backgroundColor: backgroundColor ?? CHIP_VARIANT_ZOOM.backgroundColor,
          textColor: textColor ?? CHIP_VARIANT_ZOOM.textColor,
          borderColor: borderColor ?? CHIP_VARIANT_ZOOM.borderColor,
        }
      : {
          backgroundColor: backgroundColor ?? '#007bff',
          textColor: textColor ?? '#ffffff',
          borderColor: borderColor ?? 'transparent',
        };
  const handleClick = (e) => {
    if (clickable && onClick) {
      onClick(e);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <TagContainer
      $variant={variant}
      backgroundColor={resolved.backgroundColor}
      textColor={resolved.textColor}
      borderColor={resolved.borderColor}
      clickable={clickable}
      onClick={handleClick}
      size={size}
      {...props}
    >
      {children}
      {onRemove && (
        <span className="tag-remove" onClick={handleRemove}>
          ×
        </span>
      )}
    </TagContainer>
  );
};

export default Tag;
