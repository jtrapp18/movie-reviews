import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import ReactQuill from "react-quill"; // Import ReactQuill
import 'react-quill/dist/quill.snow.css';  // Quill's default theme
import { StyledForm, Button } from "../MiscStyling";
import Error from "../styles/Error";
import Stars from "../components/Stars"
import FormSubmit from "../components/FormSubmit";
import useCrudStateDB from "../hooks/useCrudStateDB";

const ReviewForm = ({ initObj }) => {
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(!initObj);
  const [submitError, setSubmitError] = useState(null);
  const { setMovies } = useOutletContext();
  const { addToKey, updateKey } = useCrudStateDB(setMovies, "movies");
  const movieId = parseInt(id);

  const initialValues = initObj
    ? {
        rating: initObj.rating || "",
        reviewText: initObj.reviewText || "",
      }
    : {
        rating: 0,
        reviewText: "",
      };

  const submitToDB = initObj
    ? (body) => updateKey("reviews", initObj.id, body, movieId)
    : (body) => addToKey("reviews", body, movieId);

  const validationSchema = Yup.object({
    rating: Yup.number()
      .required("Rating is required.")
      .min(1, "Rating must be at least 1.")
      .max(10, "Rating must be at most 10."),
    reviewText: Yup.string()
      .required("Review text is required.")
      .min(10, "Review must be at least 10 characters long."),
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      const body = {
        ...Object.fromEntries(
          Object.entries(values).map(([key, value]) => [key, value === "" ? null : value])
        ),
        movieId: movieId,
      };

      submitToDB(body);
      setIsEditing(false);
    },
  });

  const handleQuillChange = (value) => {
    formik.setFieldValue("reviewText", value); // Update the formik value for reviewText
  };

  const updateRating = (rating) => {
    formik.setFieldValue("rating", rating);
  };


  return (
    <div>
      {isEditing ? (
        <StyledForm onSubmit={formik.handleSubmit}>
          <h2>{initObj ? "Update Review" : "Leave a Review"}</h2>
          <div>
          <Stars rating={formik.values.rating} handleStarClick={updateRating} />
            {formik.touched.rating && formik.errors.rating && (
              <Error>{formik.errors.rating}</Error>
            )}
          </div>
          <div>
            <label htmlFor="reviewText">Review:</label>
            {/* Quill Editor for reviewText */}
            <ReactQuill
              id="reviewText"
              name="reviewText"
              value={formik.values.reviewText}
              onChange={handleQuillChange}
              modules={{
                toolbar: [
                  [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  [{ 'align': [] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  ['blockquote', 'code-block'],
                  ['link', 'image'],
                  [{ 'color': [] }, { 'background': [] }],
                  ['clean']
                ]
              }}
            />
            {formik.touched.reviewText && formik.errors.reviewText && (
              <Error>{formik.errors.reviewText}</Error>
            )}
          </div>
          {submitError && <Error>{submitError}</Error>}
          <Button type="submit">{initObj ? "Update" : "Submit"}</Button>
        </StyledForm>
      ) : (
        <FormSubmit
          label={"Review Details"}
          formValues={formik.values}
          setIsEditing={setIsEditing}
        />
      )}
    </div>
  );
};

export default ReviewForm;