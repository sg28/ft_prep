import React, { useEffect, useState } from "react";

export default function ToDoList() {
  const [todoList, setTodoList] = useState([
    { name: "Fix Table", status: "pending", id: 1 },
    { name: "Fix TV", status: "done", id: 2 },
    { name: "Fix Chair", status: "pending", id: 3 },
  ]);

  const [newTask, setNewTask] = useState("");

  let enterTaskFn = (e) => {
    let value = e.target.value;
    setNewTask(value);

  };

  let addTask = (e) => {
    if(newTask && newTask.length > 0){
      let newTaskObj = {
        name: newTask,
        status: "pending",
        id: Date.now() 
      }
      setTodoList(
        [...todoList, newTaskObj]
      )
    }
    setNewTask("");
  }

  let removeTask = (id) => {
    console.log(id)
    let updatedList = todoList.filter((item) => item.id !== id);
    setTodoList(updatedList);
  }

  let updateTaskStatus =(id)=>{
   
   console.log(id)
    let updatedListWithTaskStatus = todoList.map((item) =>{
      if(item.id === id){
        return {
          ...item,
          status: item.status === "pending"? "done": "pending"
        }
      }
      return item;
    })

    setTodoList(updatedListWithTaskStatus);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f4f4f4",
        padding: "20px",
      }}
    >
      <h2 style={{ color: "#333", marginBottom: "15px" }}>To-Do List</h2>

      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Input Field and Add Button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "15px",
          }}
        >
          <input
            type="text"
            value={newTask}
            onChange={enterTaskFn}
            placeholder="Enter task..."
            style={{
              flex: "1",
              padding: "10px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "5px",
              outline: "none",
              transition: "border 0.2s",
            }}
            onFocus={(e) => (e.target.style.border = "1px solid #007bff")}
            onBlur={(e) => (e.target.style.border = "1px solid #ddd")}
          />
          <button
            onClick={addTask}
            style={{
              padding: "10px 15px",
              fontSize: "16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
          >
            Add
          </button>
        </div>

        {/* Task List */}
        <div
          style={{
            maxHeight: "250px",
            overflowY: "auto",
            borderTop: "1px solid #ddd",
            paddingTop: "10px",
          }}
        >
          {todoList.length === 0 ? (
            <p style={{ textAlign: "center", color: "grey" }}>No tasks available.</p>
          ) : (
            todoList.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px",
                  borderBottom: "1px solid #ddd",
                  borderRadius: "5px",
                  background: "#fff",
                  marginBottom: "5px",
                  boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.05)",
                }}
              >
                {/* Task Name */}
                <div style={{ flex: 1, fontSize: "16px", fontWeight: "500", color: "#333" }}>
                  {item.name}
                </div>

                {/* Task Status */}
                <span
                  onClick={()=>updateTaskStatus(item.id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "3px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    color: item.status === "done" ? "#155724" : "#721c24",
                    backgroundColor: item.status === "done" ? "#d4edda" : "#f8d7da",
                    border: `1px solid ${item.status === "done" ? "#c3e6cb" : "#f5c6cb"}`,
                    marginRight: "10px",
                  }}
                >
                  {item.status}
                </span>

                {/* Delete Button */}
                <button
                  onClick={() => removeTask(item.id)}
                  style={{
                    padding: "5px 10px",
                    fontSize: "14px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "3px",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = "#c82333")}
                  onMouseOut={(e) => (e.target.style.backgroundColor = "#dc3545")}
                >
                  ✖
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
