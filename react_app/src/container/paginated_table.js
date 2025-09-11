import React, { useState } from "react";

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    flexDirection: "column",
  },
  table: {
    width: "100%",
    border: "1px solid #ccc",
    borderCollapse: "collapse",
  },
  tableHeader: {
    backgroundColor: "#f5f5f5",
    padding: "10px",
    textAlign: "left",
  },
  tableCell: {
    padding: "8px 10px",
    borderBottom: "1px solid #ddd",
  },
  pagination: {
    marginTop: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pageInfo: {
    margin: "0 10px",
    fontSize: "14px",
  },
  button: {
    padding: "8px 12px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    cursor: "pointer",
    borderRadius: "4px",
  },
  buttonDisabled: {
    opacity: "0.5",
    cursor: "not-allowed",
  },
};

export default function PaginatedTable() {
  const employeeData = [
    { name: "John", age: 25 },
    { name: "Tim", age: 25 },
    { name: "Billie", age: 25 },
    { name: "Memphis", age: 25 },
    { name: "Nevada", age: 25 },
    { name: "Vega", age: 25 },
    { name: "Kenny", age: 25 },
    { name: "Barry", age: 25 },
    { name: "Sophia", age: 25 },
    { name: "Mia", age: 25 },
    { name: "Ethan", age: 25 },
    { name: "Lucas", age: 25 },
    { name: "Olivia", age: 25 },
    { name: "Ava", age: 25 },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; 
  const totalPages = Math.ceil(employeeData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentTableData = employeeData.slice(startIndex, startIndex + pageSize);

  const previous = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const next = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <div style={styles.container}>
      <div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.tableHeader}>Employee</th>
            </tr>
          </thead>
          <tbody>
            {currentTableData.map((data, index) => (
              <tr key={index}>
                <td style={styles.tableCell}>{data.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={styles.pagination}>
          <button 
            onClick={previous} 
            disabled={currentPage === 1}
            style={{
              ...styles.button,
              ...(currentPage === 1 ? styles.buttonDisabled : {})
            }}
          >
            Previous
          </button>
          <span style={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={next} 
            disabled={currentPage === totalPages}
            style={{
              ...styles.button,
              ...(currentPage === totalPages ? styles.buttonDisabled : {})
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
