# Chapter 9: Linked Lists

## Section 1: Singly Linked Lists

Linked lists are fundamental data structures in computer science, essential for understanding complex data manipulation. This chapter explores linked list concepts through practical algorithm implementation, focusing on common operations and problems frequently encountered in technical interviews.

### Fundamentals of Linked Lists

Linked lists are a sequence of nodes, where each node contains a value and a pointer to the next node in the sequence. This structure allows for efficient insertion and deletion of elements at any position, as it requires only the adjustment of pointers, unlike arrays, which may require shifting elements.

**Defining a Linked List**:

A simple singly linked list node can be defined as:

```python
class ListNode:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next
```

### Linked List vs. ArrayList

- **Insertions/Deletions**: Linked lists are preferable when your application involves frequent insertion and deletion of elements. Since linked lists do not require shifting elements, operations are generally more efficient compared to arrays or ArrayLists.
- **Memory**: Arrays require a contiguous block of memory, while linked lists can utilize scattered memory locations. This can be advantageous when dealing with memory fragmentation.
- **Size Flexibility**: Linked lists are dynamically sized, meaning they can grow or shrink as needed without the need for resizing, unlike static arrays or even ArrayLists, which might need to resize (an expensive operation) when elements are added beyond their capacity.

## Section 2: Doubly Linked List

A doubly linked list is a type of linked list where each node contains a reference to the next node and the previous node. This bidirectional reference allows traversal in both directions but requires extra memory for the additional pointer.

```python
class DoublyListNode:
    def __init__(self, val, prev=None, next=None):
        self.val = val
        self.prev = prev
        self.next = next
```

**Advantages**:

- **Bidirectional traversal**: You can traverse both forwards and backwards, providing flexibility in certain algorithms.
- **Easier insertions and deletions**: Especially when deleting a node or inserting at the end, as you have a direct reference to the previous node.

### Choosing Between Singly and Doubly Linked Lists

- Prefer **Singly Linked Lists** when you need simple and memory-efficient data structures and only forward traversal.
- Prefern **Doubly Linked Lists** when you require bidirectional traversal or need to frequently delete nodes from the end of the list.

## Section 3: Solved Problems

### Problem 1: [Reverse a Linked List](https://leetcode.com/problems/reverse-linked-list/)

**Problem Statement**: Implement a function to reverse a singly linked list.

**Solution**:

```python
def reverseList(head: ListNode) -> ListNode:
    prev, curr = None, head
    while curr is not None:
        prev, curr.next, curr = curr, prev, curr.next
    return prev
```

### Problem 2: [Middle of the Linked List](https://leetcode.com/problems/middle-of-the-linked-list/)

**Problem Statement**: Given a non-empty, singly linked list, return a middle node of the linked list. If there are two middle nodes, return the second middle node.

**Solution**:

```python
def middleNode(head: ListNode) -> ListNode:
    slow, fast = head, head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow
```

**Explanation**: This solution uses the two-pointer technique. The `fast` pointer moves two steps at a time while the `slow` pointer moves one step. When the `fast` pointer reaches the end of the list, the `slow` pointer will be at the middle.

### Problem 3: [Detect Cycle in a Linked List](https://leetcode.com/problems/linked-list-cycle/)

**Problem Statement**: Determine whether a linked list has a cycle in it.

**Solution**:

```python
def hasCycle(head: ListNode) -> bool:
    slow, fast = head, head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False
```

**Explanation**: Use two pointers, `slow` and `fast`, moving at different speeds. If they meet, a cycle exists.

### Problem 4: [Merge Two Sorted Lists](https://leetcode.com/problems/merge-two-sorted-lists/)

**Problem Statement**: Merge two sorted linked lists and return it as a sorted list.

**Solution**:

```python
def mergeTwoLists(l1: ListNode, l2: ListNode) -> ListNode:
    dummy = ListNode(None)
    tail = dummy
    
    while l1 and l2:
        if l1.val < l2.val:
            tail.next, l1 = l1, l1.next
        else:
            tail.next, l2 = l2, l2.next
        tail = tail.next
        
    tail.next = l1 or l2
    return dummy.next
```

**Explanation**: The dummy node serves as an anchor for the merged list, preventing edge-case issues. We iteratively compare nodes from both lists and append the smaller one to the merged list.

### Problem 5: [Delete Node in a Linked List](https://leetcode.com/problems/delete-node-in-a-linked-list/description/)

**Problem Statement**: Write a function to delete a node in a singly linked list, given only access to that node.

**Solution**:

```python
def deleteNode(node):
    node.val = node.next.val
    node.next = node.next.next
```

**Explanation**: Since we don't have access to the previous node, we copy the value of the next node into the current node and then delete the next node by adjusting the pointers. This effectively deletes the target node from the list.

### Problem 6: [Remove Duplicates from Sorted List](https://leetcode.com/problems/remove-duplicates-from-sorted-list/)

**Problem Statement**: Given the head of a sorted linked list, delete all duplicates such that each element appears only once.

**Solution**:

```python
def deleteDuplicates(head: ListNode) -> ListNode:
    current = head
    while current and current.next:
        if current.val == current.next.val:
            current.next = current.next.next
        else:
            current = current.next
    return head
```

**Explanation**: Since the list is sorted, duplicates are adjacent. Traverse the list and skip over any duplicate nodes by adjusting pointers.

### Problem 7: [Delete the Middle Node of a Linked List](https://leetcode.com/problems/delete-the-middle-node-of-a-linked-list/)

**Problem Statement**: You are given the head of a linked list. Delete the middle node, and return the head of the modified list.

**Solution**:

```python
def deleteMiddle(head: ListNode) -> ListNode:
    if not head or not head.next:
        return None
    
    slow, fast, prev = head, head, None
    while fast and fast.next:
        prev = slow
        slow = slow.next
        fast = fast.next.next
    
    prev.next = slow.next
    return head
```

**Explanation**: Similar to finding the middle node, use the fast and slow pointer technique to locate the middle node. Keep track of the node before the middle (`prev`) to perform the deletion.

### Problem 8: [Remove Nth Node From End of List](https://leetcode.com/problems/remove-nth-node-from-end-of-list/)

**Problem Statement**: Remove the `n`th node from the end of a linked list.

**Solution**:

```python
def removeNthFromEnd(head: ListNode, n: int) -> ListNode:
    dummy = ListNode(0, head)
    slow = fast = dummy
    for _ in range(n):
        fast = fast.next
    while fast.next:
        slow = slow.next
        fast = fast.next
    slow.next = slow.next.next
    return dummy.next
```

**Explanation**: Use two pointers separated by `n` nodes. When `fast` reaches the end, `slow` is at the predecessor of the target node.

### Problem 9: [Palindrome Linked List](https://leetcode.com/problems/palindrome-linked-list/)

**Problem Statement**: Determine whether a linked list is a palindrome.

**Solution**:

```python
def isPalindrome(head: ListNode) -> bool:
    if not head or not head.next:
        return True

    # Step 1: Find the middle of the linked list
    slow, fast = head, head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    
    # Step 2: Reverse the second half
    prev, curr = None, slow
    while curr:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    
    # Step 3: Compare the two halves
    left, right = head, prev
    while right:
        if left.val != right.val:
            return False
        left, right = left.next, right.next
    
    return True
```

**Explanation**:

- By finding the middle of the list, we can split the list into two halves.
- Reversing the second half allows us to directly compare it with the first half.
- If all corresponding nodes in the two halves are equal, the list is a palindrome.
- This approach ensures O(n) time complexity and O(1) space complexity, where n is the number of nodes in the linked list.

### Problem 10: [Reorder List](https://leetcode.com/problems/reorder-list/description/)

**Problem Statement**: Reorder a linked list `L0 → L1 → … → Ln-1 → Ln` to `L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → …`.

**Solution**:

```python
def reorderList(head: ListNode) -> None:
    if not head or not head.next or not head.next.next:
        return
    
    # Find the middle of the linked list
    slow, fast = head, head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    
    # Reverse the second half of the list
    prev, curr = None, slow.next
    while curr:
        next_temp = curr.next
        curr.next = prev
        prev = curr
        curr = next_temp
    
    # Merge the two halves
    slow.next, first, second = None, head, prev
    while second:
        temp1, temp2 = first.next, second.next
        first.next = second
        second.next = temp1
        first, second = temp1, temp2
```

**Explanation**: This problem involves three main steps: finding the middle of the list, reversing the second half, and then merging the two halves in the specified order.

### Problem 11: [Rotate List](https://leetcode.com/problems/rotate-list/)

**Problem Statement**: Given the head of a linked list, rotate the list to the right by `k` places.

**Solution**:

```python
def rotateRight(head: ListNode, k: int) -> ListNode:
    if not head or not head.next or k == 0:
        return head
    
    # Compute the length and establish the circular linked list
    tail, length = head, 1
    while tail.next:
        tail = tail.next
        length += 1
    tail.next = head  # Make it circular
    
    # Find the new head after the rotation
    steps_to_new_head = length - k % length
    new_tail = head
    for _ in range(steps_to_new_head - 1):
        new_tail = new_tail.next
    
    # Break the cycle and set the new head
    new_head = new_tail.next
    new_tail.next = None
    
    return new_head
```

**Explanation**: First, form a circular linked list and find the list's length. Then, break the circle at the correct position to achieve the rotation.

### Problem 12: [Linked List Cycle II](https://leetcode.com/problems/linked-list-cycle-ii/)

**Problem Statement**: Given a linked list, return the node where the cycle begins. If there is no cycle, return null.

**Solution**:

```python
def detectCycle(head: ListNode) -> ListNode:
    slow, fast = head, head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            break
    else:
        return None
    
    slow = head
    while slow != fast:
        slow = slow.next
        fast = fast.next
    
    return slow
```

**Explanation**: This solution extends the Floyd's Tortoise and Hare algorithm. After finding a meeting point inside the cycle (if it exists), one pointer starts again from the head, and both pointers now move at the same pace. The point where they meet again is the start of the cycle.

### Problem 13: [Intersection of Two Linked Lists](https://leetcode.com/problems/intersection-of-two-linked-lists/)

**Problem Statement**: Given the heads of two singly linked lists, find if the two lists intersect. Return the intersecting node. Note that the intersection is defined based on reference, not value.

**Solution**:

```python
def getIntersectionNode(headA: ListNode, headB: ListNode) -> ListNode:
    pointerA, pointerB = headA, headB
    
    while pointerA != pointerB:
        pointerA = headB if pointerA is None else pointerA.next
        pointerB = headA if pointerB is None else pointerB.next
        
    return pointerA
```

**Explanation**: Traverse both lists simultaneously, switching heads when reaching the end. If the lists intersect, the pointers will meet at the intersection node; otherwise, they'll both reach `None`.

### Problem 14: [Split Linked List in Parts](https://leetcode.com/problems/split-linked-list-in-parts/)

**Problem Statement**: Given the head of a linked list and an integer `k`, split the linked list into `k` consecutive linked list parts.

**Solution**:

```python
def splitListToParts(head: ListNode, k: int) -> List[ListNode]:
    size = get_size(head)
    min_len, one_more = divmod(size, k)  # Calculate the minimum length and the count of longer parts
    res = []
    current = ListNode(None)
    current.next = head

    for i in range(k):
        ans = current
        for _ in range(min_len + int(i < one_more)):  # Move the end of the current part
            current = current.next
        res.append(ans.next)  # Append the current part to the result
        ans.next = None  # Detach the current part from the list

    return res

def get_size(head: ListNode) -> int:
    size = 0
    while head:
        size += 1
        head = head.next
    return size
```

**Explanation**: The function `splitListToParts` divides a linked list into `k` parts as evenly as possible. It first calculates the total size of the list using `get_size` to determine how to distribute the nodes. Each part gets a minimum length of `min_len`, with the first `one_more` parts receiving an extra node to handle the remainder. The loop iterates `k` times, creating a new sublist each iteration, advancing the `current` pointer accordingly, and appending the sublist to the `res` list. Finally, it returns `res`, which contains `k` sublists representing the split linked list.

### Problem 15: [Flatten a Multilevel Doubly Linked List](https://leetcode.com/problems/flatten-a-multilevel-doubly-linked-list/)

**Problem Statement**: You are given a doubly linked list with nodes that have a child pointer, which may point to a separate doubly linked list. These child lists may have further child nodes. Flatten the list so that all nodes appear in a single-level, doubly linked list.

**Solution**:

```python
class Node:
    def __init__(self, val, prev, next, child):
        self.val = val
        self.prev = prev
        self.next = next
        self.child = child

def flatten(head: Node) -> Node:
    if not head:
        return None

    current = head
    while current:
        if current.child:
            # Save the next pointer
            nextNode = current.next
            # Recursively flatten the child list
            child = flatten(current.child)
            
            # Connect current node to the child and vice versa
            current.next, child.prev = child, current
            current.child = None
            
            # Find the end of the child list and connect it to nextNode
            while current.next:
                current = current.next
            current.next = nextNode
            if nextNode:
                nextNode.prev = current
        
        current = current.next
    
    return head
```

**Explanation**: The function recursively flattens child lists, adjusting the `next` and `prev` pointers to maintain the doubly linked list structure.

### Problem 16: [Add Two Numbers](https://leetcode.com/problems/add-two-numbers/)

**Problem Statement**: You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.

**Solution**:

```python
def addTwoNumbers(l1: ListNode, l2: ListNode) -> ListNode:
    dummy = ListNode(0)
    current, carry = dummy, 0
    
    while l1 or l2 or carry:
        val1 = (l1.val if l1 else 0) + (l2.val if l2 else 0) + carry
        carry, val = divmod(val1, 10)
        current.next = ListNode(val)
        
        current = current.next
        l1 = l1.next if l1 else None
        l2 = l2.next if l2 else None
        
    return dummy.next
```

**Explanation**: Iterate through both linked lists, summing the values of corresponding nodes along with the carry from the previous addition. Construct a new linked list from the resulting sums.

### Problem 17: [Plus One Linked List](https://www.lintcode.com/problem/904/)

**Problem Statement**: Given a non-negative integer represented as a linked list of digits, plus one to the integer.

**Solution**:

```python
def plusOne(head: ListNode) -> ListNode:
    # Reverse the linked list
    def reverseList(node):
        prev, curr = None, node
        while curr:
            next_node = curr.next
            curr.next = prev
            prev = curr
            curr = next_node
        return prev

    head = reverseList(head)

    # Plus one
    curr, carry = head, 1
    while curr and carry:
        curr.val += carry
        carry = curr.val // 10
        curr.val %= 10
        if carry and not curr.next:
            curr.next = ListNode(0)
        curr = curr.next

    return reverseList(head)
```

**Explanation**: This solution involves reversing the linked list to simplify the addition process, performing the addition, and then reversing the list again to restore the original order.

### Problem 18: [Odd Even Linked List](https://leetcode.com/problems/odd-even-linked-list/)

**Problem Statement**: Group all the nodes with odd indices together followed by the nodes with even indices, and return the reordered list.

**Solution**:

```python
def oddEvenList(head: ListNode) -> ListNode:
    if not head or not head.next:
        return head
    
    odd, even = head, head.next
    even_head = even
    
    while even and even.next:
        odd.next = even.next
        odd = odd.next
        even.next = odd.next
        even = even.next
    
    odd.next = even_head
    return head
```

**Explanation**: Maintain two pointers, `odd` and `even`, to connect odd-indexed nodes and even-indexed nodes, respectively. Finally, link the end of the odd-indexed list to the head of the even-indexed list.

### Problem 19: [Reverse Nodes in k-Group](https://leetcode.com/problems/reverse-nodes-in-k-group/description/)

**Problem Statement**: Given a linked list, reverse the nodes of a group of size `k` and return its modified list. If the number of nodes is not a multiple of `k`, then leave the last nodes as is.

**Solution**:

```python
def reverseKGroup(head: ListNode, k: int) -> ListNode:
    dummy = ListNode(0)
    dummy.next = head
    group_prev = dummy

    while True:
        kth = group_prev
        for _ in range(k):
            kth = kth.next
            if not kth:
                return dummy.next
        group_next = kth.next

        # Reverse the group
        prev, curr = kth.next, group_prev.next
        for _ in range(k):
            temp = curr.next
            curr.next = prev
            prev = curr
            curr = temp

        temp = group_prev.next
        group_prev.next = kth
        group_prev = temp

    return dummy.next
```

**Explanation**: The process involves identifying the `k`-th node for each group, reversing the nodes within the group, and then adjusting the pointers to connect the groups correctly.

## Section 4: Exercises

1. **[Remove Duplicates from Unsorted List II](https://leetcode.com/problems/remove-duplicates-from-sorted-list-ii/)**
2. **[Swap Nodes in Pairs](https://leetcode.com/problems/swap-nodes-in-pairs/)**
3. **[Reverse Linked List II](https://leetcode.com/problems/reverse-linked-list-ii/)**
4. **[Maximum Twin Sum of a Linked List](https://leetcode.com/problems/maximum-twin-sum-of-a-linked-list/)**
5. **[Merge In Between Linked Lists](https://leetcode.com/problems/merge-in-between-linked-lists/)**
6. **[Design Linked List](https://leetcode.com/problems/design-linked-list/)**
7. **[Design Browser History](https://leetcode.com/problems/design-browser-history/)**
