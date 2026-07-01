
function human(...args) {
    let list = [...args];
    return this.name + " has a " + list[0] + " and a " + list[1];
}

let Indian = {
    name: "Rakesh",
    age: 30
};
let American = {
    name: "James",
    age: 44
};

let entity = human.apply(Indian, ["black-hair", "brown-eye"]);
console.log("entity ", entity);




