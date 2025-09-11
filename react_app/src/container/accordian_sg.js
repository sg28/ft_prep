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
  accordionItem: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    marginBottom: "10px",
    overflow: "hidden",
  },
  header: {
    cursor: "pointer",
    padding: "15px",
    backgroundColor: "#f5f5f5",
    fontWeight: "bold",
    fontSize: "16px",
    borderBottom: "1px solid #ddd",
    transition: "background-color 0.3s ease",
  },
  content: {
    padding: "15px",
    backgroundColor: "white",
    color: "#555",
    lineHeight: "1.6",
    borderTop: "1px solid #eee",
  },
};

export default function According_Sg() {
  let [count, setcount] = useState(0);
  let [data, setData] = useState([
    { id: "1", animal: "Animals are great", hide: true },
    { id: "2", animal: "humans are intelligent", hide: true },
    { id: "3", animal: "birds are nimble", hide: true },
  ]);

  let openCloseContent = (elem) => {
    setData((prevState) =>
      prevState.map((item) =>
        item.id === elem.id ? { ...item, hide: !item.hide } : item
      )
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>Accordian</div>
      {data.map((e) => {
        return (
          <div key={e.id} style={styles.accordionItem}>
            <div onClick={() => openCloseContent(e)} style={styles.header}>
              Item {e.id}
            </div>
            {!e.hide && (
              <div style={styles.content}>{e.animal}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
