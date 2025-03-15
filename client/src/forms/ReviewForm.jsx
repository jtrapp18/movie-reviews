import React, { useState } from "react";
import {useOutletContext} from "react-router-dom";
import { useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { StyledForm, Button } from "../MiscStyling";
import Error from "../styles/Error";
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
        rating: "",
        reviewText: "",
      };

      const submitToDB = initObj
      ? (body) =>
          updateKey("reviews", initObj.id, body, movieId)
      : (body) =>
          addToKey("reviews", body, movieId)
   
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

  return (
    <div>
      {isEditing ? (
        <StyledForm onSubmit={formik.handleSubmit}>
          <h2>{initObj ? "Update Review" : "Leave a Review"}</h2>
          <div>
            <label htmlFor="rating">Rating (1-10):</label>
            <input
              type="number"
              id="rating"
              name="rating"
              min="1"
              max="10"
              value={formik.values.rating}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.rating && formik.errors.rating && (
              <Error>{formik.errors.rating}</Error>
            )}
          </div>
          <div>
            <label htmlFor="reviewText">Review:</label>
            <textarea
              id="reviewText"
              name="reviewText"
              value={formik.values.reviewText}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
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