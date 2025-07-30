import React, { useState } from "react";

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
    <div
    style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
      }}
    >
      <div>
        <table border="1" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Employee</th>
            </tr>
          </thead>
          <tbody>
            {currentTableData.map((data, index) => (
              <tr key={index}>
                <td>{data.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop: "10px" }}>
          <button onClick={previous} disabled={currentPage === 1}>
            Previous
          </button>
          <span style={{ margin: "0 10px" }}>
            Page {currentPage} of {totalPages}
          </span>
          <button onClick={next} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
