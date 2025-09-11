import React, { useState } from "react";

const styles = {
  container: {
    padding: "20px",
  },
  openButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "16px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    position: "relative",
    width: "50%",
    maxWidth: "600px",
    border: "1px solid lightgrey",
    padding: "20px",
    borderRadius: "10px",
    background: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.3)",
  },
  header: {
    margin: "0 0 15px 0",
    color: "#333",
    fontSize: "20px",
  },
  content: {
    marginBottom: "20px",
    textAlign: "center",
    lineHeight: "1.5",
    color: "#555",
  },
  buttonContainer: {
    marginTop: "10px",
  },
  closeButton: {
    padding: "8px 16px",
    backgroundColor: "#6c757d",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default function CustomModal() {
  let [modalstate, setmodalstate] = useState(false);

  let modalHandleFn = () => {
    setmodalstate(!modalstate);
  };

  return (
    <div style={styles.container}>
      <button onClick={modalHandleFn} style={styles.openButton}>
        Open Modal
      </button>

      {modalstate && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h5 style={styles.header}>Header</h5>
            <section style={styles.content}>
              <p>
                One morning, when Gregor Samsa woke from troubled dreams, he
                found himself transformed in his bed into a horrible vermin. He
                lay on his armour-like back, and if he lifted his head a little
                he could see his brown belly, slightly domed and divided by
                arches into stiff sections.
              </p>
            </section>
            <div style={styles.buttonContainer}>
              <button onClick={modalHandleFn} style={styles.closeButton}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
