# Paginated API Calls with async/await

```js
async function fetchData(pageNumber) {
    const response = await fetch(`https://api.example.com/data?page=${pageNumber}`);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
}

async function handlePagination() {
    let currentPage = 1;
    try {
        let data = await fetchData(currentPage);
        let totalPages = data.totalPages;

        while (currentPage < totalPages) {
            currentPage++;
            data = await fetchData(currentPage);
        }
    } catch (error) {
        console.error('Failed to fetch data:', error);
    }
}

handlePagination();
```
