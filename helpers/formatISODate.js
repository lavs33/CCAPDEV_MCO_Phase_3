function formatDateISO(date) {
    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date format');
    }
  
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const day = String(parsedDate.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
}
  
  module.exports = formatDateISO;