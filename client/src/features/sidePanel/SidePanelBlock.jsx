import MotionWrapper from '@styles/MotionWrapper';
import { SidePanelBlockRoot, SidePanelBlockTitle } from './sidePanelStyles';

/**
 * Shared layout for titled blocks inside the home side panel (red shell).
 * Pass custom `children` for real content; use `SidePanelPlaceholder` for staging.
 */
function SidePanelBlock({
  title,
  titleId,
  children,
  motionIndex = 0,
  fill = false,
  ...rest
}) {
  return (
    <SidePanelBlockRoot $fill={fill} aria-labelledby={titleId} {...rest}>
      <MotionWrapper index={motionIndex}>
        <SidePanelBlockTitle id={titleId}>{title}</SidePanelBlockTitle>
      </MotionWrapper>
      {children}
    </SidePanelBlockRoot>
  );
}

export default SidePanelBlock;
