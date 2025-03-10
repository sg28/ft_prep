import React, { useEffect, useState } from "react";

export default function ToDoList() {
  let list = [
    {
      name: "fix_table",
      status: "pending",
      id: 1,
    },
    {
      name: "fix_tv",
      status: "done",
      id: 2,
    },
    {
      name: "fix_chair",
      status: "pending",
      id: 3,
    },
  ];
  let [todoList, setTodoList] = useState(list);
  let enterTaskFn = (e) => {
    console.log(" enter task ", e.target.value);
  };

  return (
    <div>
      <h5>To Do List</h5>
      <div
        className="list-container"
        style={{
          display: "flex",
          border: "1px solid lightgrey",
          padding: "5px",
          margin: "auto",
          width: "50%",
          borderRadius: "5px",
        }}
      >
        <div className="input-container">
          <input onChange={enterTaskFn} placeholder="enter task" />
        </div>
        <div
          className="list-container"
          style={{ maxHeight: "50px", overflowY: "scroll" }}
        >
          {todoList.map((item) => {
            return <div>
              <div key={item.id}>{item}</div>
              <span style={{ padding: "5px", border: "1px solid lightgrey" }}>
                {item.status}
              </span>
              <span>
                <button style={{ padding: "2px" }}> X </button>
              </span>
            </div>;
          })}
        </div>
      </div>
    </div>
  );
}
