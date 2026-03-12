import { useNavigate } from "react-router-dom";
import { MediaCard, CardContent, CardOverlay, Tag, TagContainer, CardDate, CardTitle } from "../styles/cards";
import { formatDate } from "../utils/formatting";

const backdrop = "/images/card-backdrop.jpeg";


function ArticleCard({ article }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/articles/${article.id}`);
  };


  return (
    <MediaCard onClick={handleClick}>
      <img src={backdrop} alt="article backdrop" />

      <CardDate>{formatDate(article.dateAdded)}</CardDate>

      <CardContent>
        <CardTitle>
          {article.title || "Untitled Article"}
        </CardTitle>
        <TagContainer>
          {article.tags.length > 0 && (
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
      </CardContent>
      <CardOverlay>
        <p>{article.description || "No description available"}</p>
      </CardOverlay>
    </MediaCard>
  );
}

export default ArticleCard;