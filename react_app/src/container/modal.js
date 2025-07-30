import React, { useState } from "react";

export default function CustomModal() {
  let [modalstate, setmodalstate] = useState(false);

  let modalHandleFn = () => {
    setmodalstate(!modalstate);
  };

  return (
    <div>
      <button onClick={modalHandleFn}>Open Modal</button>

      {modalstate && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "50%",
            border: "1px solid lightgrey",
            padding: "20px",
            borderRadius: "10px",
            background: "lightblue",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          }}
        >
          <h5>Header</h5>
          <section>
            <p>
              One morning, when Gregor Samsa woke from troubled dreams, he
              found himself transformed in his bed into a horrible vermin. He
              lay on his armour-like back, and if he lifted his head a little
              he could see his brown belly, slightly domed and divided by
              arches into stiff sections.
            </p>
          </section>
          <div style={{ marginTop: "10px" }}>
            <button onClick={modalHandleFn} style={{ marginRight: "10px" }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
