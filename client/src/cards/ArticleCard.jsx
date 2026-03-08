import { useNavigate } from "react-router-dom";
import { MediaCard, CardContent, CardOverlay, Tag, TagContainer, CardDate, CardTitle } from "../styles/cards";

const backdrop = "/images/card-backdrop.jpeg";


function ArticleCard({ article }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/articles/${article.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  };

  return (
    <MediaCard onClick={handleClick}>
      <img src={backdrop} alt="article backdrop" />

      <CardDate>{formatDate(article.dateAdded)}</CardDate>

      <CardContent>
        <TagContainer>
          {article.tags && article.tags.length > 0 && (
            <>
              {article.tags.slice(0, 3).map((tag, index) => (
                <Tag key={tag.id || index}>{tag.name}</Tag>
              ))}
              {article.tags.length > 3 && (
                <Tag>+{article.tags.length - 3}</Tag>
              )}
            </>
          )}
        </TagContainer>
        <CardTitle>
          {article.title || "Untitled Article"}
        </CardTitle>
      </CardContent>
      <CardOverlay>
        <p>{article.description || "No description available"}</p>
      </CardOverlay>
    </MediaCard>
  );
}

export default ArticleCard;