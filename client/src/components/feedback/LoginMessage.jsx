import { StyledContainer } from "@styles";
import { Link } from "react-router-dom";


function LoginMessage({ message }) {

    return (
        <StyledContainer>
            <div className="subtitle">
                To {message},
                <Link to="/login">
                    Log In
                </Link>
                or
                <Link to="/signup">
                    Sign Up
                </Link>
            </div>
        </StyledContainer>
  );
}

export default LoginMessage;