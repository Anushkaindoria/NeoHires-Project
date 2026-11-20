function SortSelector({ sortBy, setSortBy, showMonthOption }) {
  return (
    <section className="sort-selector">
      <label htmlFor="sort-by">Sort by:</label>
      <select
        id="sort-by"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="none">Default</option>
        <option value="company-asc">Company (A–Z)</option>
        <option value="company-desc">Company (Z–A)</option>
        {showMonthOption && <option value="month-order">Month (Jan → Dec)</option>}
      </select>
    </section>
  );
}

export default SortSelector;