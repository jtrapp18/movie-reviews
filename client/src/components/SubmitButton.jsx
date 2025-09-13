import React from 'react';
import { Button } from '../MiscStyling';

const SubmitButton = ({ 
  isSubmitting, 
  isEdit, 
  editText = "Save Changes", 
  createText = "Submit" 
}) => (
  <Button type="submit" disabled={isSubmitting}>
    {isSubmitting ? "Saving..." : (isEdit ? editText : createText)}
  </Button>
);

export default SubmitButton;
