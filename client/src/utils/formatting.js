const formatDate = (dateString) => {
    if (!dateString) return 'No date';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Date formatting error:', error, 'dateString:', dateString);
      return 'Invalid date';
    }
}

export { formatDate };
