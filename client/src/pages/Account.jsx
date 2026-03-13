import { useContext, useState } from "react";
import styled from "styled-components";
import { StyledContainer, StyledForm, Button } from "../styles";
import { UserContext } from "../context/userProvider";
import { patchJSONToDb, snakeToCamel } from "../helper";
import Error from "../styles/Error";

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  h1 {
    // font-size: clamp(2rem, 6vw, 3rem);
    margin-bottom: 0.5rem;
  }

  .subtitle {
    // font-size: clamp(1.1rem, 3vw, 1.3rem);
    font-style: italic;
  }
`;

const Row = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
`;

const ColorBubble = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: ${(props) => props.$color || "var(--cinema-gold)"};
`;

const HiddenColorInput = styled.input.attrs({ type: "color" })`
  position: absolute;
  top: 0;
  left: 0;
  width: 32px;
  height: 32px;
  opacity: 0;
  cursor: pointer;
  border: none;
  padding: 0;
`;

function Account() {
  const { user, setUser } = useContext(UserContext);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || "");
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [iconColor, setIconColor] = useState(user?.iconColor || "#0000ff");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!user) {
    return (
      <StyledContainer>
        <Header>
          <h1>Account</h1>
          <div className="subtitle">You need to be logged in to manage your account.</div>
        </Header>
      </StyledContainer>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        username,
        firstName,
        email,
        iconColor,
      };
      const updated = await patchJSONToDb("users", user.id, payload);
      const updatedCamel = snakeToCamel(updated);
      setUser(updatedCamel);
      setSuccess("Account updated.");
      setEditing(false);
    } catch (err) {
      console.error(err);
      setError("Failed to update account.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <StyledContainer>
      <Header>
        <h1>Account Settings</h1>
        <div className="subtitle">View and update your profile details.</div>
      </Header>
      {!editing && (
        <>
          <StyledForm as="div">
            <div>
              <label>Username</label>
              <div>{user.username}</div>
            </div>
            <div>
              <label>Name</label>
              <div>{user.firstName}</div>
            </div>
            <div>
              <label>Email</label>
              <div>{user.email}</div>
            </div>
            <div>
              <label>Mode</label>
              <div>{user.darkMode ? "Dark" : "Light"}</div>
            </div>
            <div>
              <Row>
                <ColorBubble $color={user.iconColor || "#0000ff"} />
              </Row>
            </div>
          </StyledForm>
          <Button variant="outline" color="primary" type="button" onClick={() => setEditing(true)}>
            Edit account
          </Button>
        </>
      )}
      {editing && (
        <StyledForm onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="firstName">Name</label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Row>
              <ColorBubble $color={iconColor} />
              <HiddenColorInput
                value={iconColor}
                onChange={(e) => setIconColor(e.target.value)}
                aria-label="Choose icon color"
              />
            </Row>
          </div>
          {error && <Error>{error}</Error>}
          {success && <div style={{ color: "var(--cinema-gold)" }}>{success}</div>}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <Button variant="fill" color="primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
            <Button
              variant="outline"
              color="primary"
              type="button"
              onClick={() => {
                setEditing(false);
                setError(null);
                setSuccess(null);
                setUsername(user.username || "");
                setFirstName(user.firstName || "");
                setEmail(user.email || "");
                setIconColor(user.iconColor || "#0000ff");
              }}
            >
              Cancel
            </Button>
          </div>
        </StyledForm>
      )}
    </StyledContainer>
  );
}

export default Account;

