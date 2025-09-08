import styled from "styled-components";
import { motion } from "framer-motion";

const MotionArticle = styled(motion.div)`
  display: flex;
  justify-content: center;
  width: 100%;
  opacity: 0; /* Start hidden */
`;

const MotionWrapper = ({ index, children }) => {
  return (
    <MotionArticle
      initial={{ opacity: 0, y: 10 }} // Reduced from 20 to 10
      animate={{ opacity: 1, y: 0 }} // Moves up and fades in
      transition={{ delay: index * 0.1, duration: 0.3 }} // Reduced delay and duration
    >
      {children}
    </MotionArticle>
  );
};

export default MotionWrapper;