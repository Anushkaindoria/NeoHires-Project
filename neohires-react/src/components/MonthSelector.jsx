const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function MonthSelector({ selectedMonth, setSelectedMonth }) {
  return (
    <section id="months">
      {MONTHS.map((month) => (
        <button
          key={month}
          className={`month-btn ${selectedMonth === month ? "active" : ""}`}
          onClick={() => setSelectedMonth(month)}
        >
          {month}
        </button>
      ))}
    </section>
  );
}

export default MonthSelector;