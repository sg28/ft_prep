import React from "react";
import { useEffect, useState } from "react";

const styles = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#333",
    textAlign: "center",
  },
  accordionWrapper: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    overflow: "hidden",
  },
  header: {
    cursor: "pointer",
    fontWeight: "bold",
    padding: "15px",
    backgroundColor: "#f5f5f5",
    borderBottom: "1px solid #ddd",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "background-color 0.3s ease",
  },
  headerHover: {
    backgroundColor: "#e9e9e9",
  },
  icon: {
    fontSize: "14px",
    transition: "transform 0.3s ease",
  },
  content: {
    padding: "20px",
    lineHeight: "1.6",
    backgroundColor: "white",
    color: "#555",
    animation: "slideDown 0.3s ease",
  },
};

function Accordion() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>Accordion</div>
      <div style={styles.accordionWrapper}>
        <div
          onClick={toggleAccordion}
          style={styles.header}
        >
          <span>Description</span>
          <span style={styles.icon}>{isOpen ? "▲" : "▼"}</span>
        </div>

        {isOpen && (
          <div style={styles.content}>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book. It has survived not
            only five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged. It was popularized in the 1960s
            with the release of Letraset sheets containing Lorem Ipsum passages,
            and more recently with desktop publishing software like Aldus
            PageMaker including versions of Lorem Ipsum.
          </div>
        )}
      </div>
    </div>
  );
}

export default Accordion;
