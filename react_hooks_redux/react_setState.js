/*
    Direct State Update
    Use When: State doesn't depend on the previous value.

*/
const [count, setCount] = useState(0);
setCount(5); // Updates count to 5

/*
    Functional State Update
    Use When: State update depends on the previous value.
*/ 
    const [count, setCount] = useState(0);
    setCount(prevCount => prevCount + 1); 


/*
    Updating Objects in State
    Use When: You need to update a specific property in an object without mutating the original state.

*/
    const [user, setUser] = useState({ name: "John", age: 25 });
    setUser(prevUser => ({ ...prevUser, age: 26 })); // Updates only age


/*
    Updating Arrays in State
    Use When: Adding/removing elements in an array.

*/  
    const [tasks, setTasks] = useState(["Task 1", "Task 2"]);
    setTasks(prevTasks => [...prevTasks, "Task 3"]); // Adds new task


/*
    Updating Arrays of Objects (Mapping State).
    Use When: Updating a specific item in an array of objects.
*/    

const [users, setUsers] = useState([
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" }
  ]);
  
  setUsers(prevUsers => 
    prevUsers.map(user => 
      user.id === 1 ? { ...user, name: "Updated Alice" } : user
    )
  );

/*
  Resetting State to Initial Value
*/  

const [form, setForm] = useState({ name: "", email: "" });
setForm({ name: "", email: "" }); // Resets form fields


/*
  Toggling Boolean State

*/
const [isVisible, setIsVisible] = useState(false);
setIsVisible(prev => !prev); // Toggles between true/false

