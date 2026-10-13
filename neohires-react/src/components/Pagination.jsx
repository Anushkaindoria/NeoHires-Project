function Pagination({ currentPage, totalPages, setCurrentPage }) {
  if (totalPages <= 1) return null;

  const goPrev = () => setCurrentPage((page) => Math.max(page - 1, 1));
  const goNext = () => setCurrentPage((page) => Math.min(page + 1, totalPages));

  return (
    <section className="pagination">
      <button onClick={goPrev} disabled={currentPage === 1}>
        Previous
      </button>

      <span className="pagination-info">
        Page {currentPage} of {totalPages}
      </span>

      <button onClick={goNext} disabled={currentPage === totalPages}>
        Next
      </button>
    </section>
  );
}

export default Pagination;