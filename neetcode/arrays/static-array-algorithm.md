## 1. Reading from an Array

```plaintext
let myArray = [1, 3, 5];
let element = myArray[i];
```

## 2. Traversing through an Array

### **Using a For Loop**

```plaintext
for (let i = 0; i < myArray.length; i++) {
    console.log(myArray[i]);
}
```

### **Using a While Loop**

```plaintext
let i = 0;
while (i < myArray.length) {
    console.log(myArray[i]);
    i++;
}
```

## 3. Deleting from an Array

### **a. Deleting from the End of the Array**

```plaintext
function removeEnd(arr, length) {
    if (length > 0) {
        arr[length - 1] = 0;
        length--;
    }
}
```

### **b. Deleting at an Ith Index**

```plaintext
function removeAtIndex(arr, index, length) {
    for (let i = index; i < length - 1; i++) {
        arr[i] = arr[i + 1];
    }
    length--;
}
```

## 4. Insertion

### **a. Inserting at the End**

```plaintext
function insertAtEnd(arr, value, length) {
    arr[length] = value;
    length++;
}
```

### **b. Inserting at the Ith Index**

```plaintext
function insertAtIndex(arr, value, index, length) {
    for (let i = length; i > index; i--) {
        arr[i] = arr[i - 1];
    }
    arr[index] = value;
    length++;
}
```
