const http = require('http'); // Built-in Node.js module for creating a server

const hostname = '127.0.0.1'; // Replace with desired hostname if needed
const port = 3000; // Replace with desired port if needed

const users = {}; // Object to store user data (username: { password, loanedBooks })
const books = []; // Array to store book data ({ title, author, available })

// Function to handle incoming requests
const server = http.createServer((req, res) => {
    const { method, url, headers } = req; // Destructure request object properties
    const body = []; // Array to store request body data chunks

    req.on('data', (chunk) => { // Event listener for incoming data chunks
        body.push(chunk);
    });

    req.on('end', () => { // Event listener for request completion
        const parsedBody = Buffer.concat(body).toString(); // Combine data chunks
        let data;
        try {
            data = JSON.parse(parsedBody); // Parse JSON data from request body
        } catch (error) {
            res.statusCode = 400; // Bad Request
            res.end('Invalid JSON data in request body!');
            return;
        }

        // Route handling based on method and URL
        if (url === '/users') {
            if (method === 'POST') {
                createUser(res, data);
            } else if (method === 'GET') {
                getAllUsers(res);
            } else {
                res.statusCode = 405; // Method Not Allowed
                res.end('Method not allowed for this route!');
            }
        } else if (url.startsWith('/users/')) { // Assuming user ID follows /users/
            const userId = url.split('/')[2];
            if (method === 'POST') {
                authenticateUser(res, userId, data);
            } else {
                res.statusCode = 405; // Method Not Allowed
                res.end('Method not allowed for route!');
            }
        } else if (url.startsWith('/books/')) {
            const bookId = parseInt(url.split('/')[2]); // Assuming book ID after /books/
            switch (method) {
                case 'POST':
                    createBook(res, data);
                    break;
                case 'DELETE':
                    deleteBook(res, bookId);
                    break;
                case 'POST': // Loaning Out a Book
                    loanOutBook(res, bookId, data); // Data might contain user ID
                    break;
                case 'POST': // Returning a Book
                    returnBook(res, bookId, data); // Data might contain user ID
                    break;
                case 'PUT':
                    updateBook(res, bookId, data); // Update book details
                    break;
                default:
                    res.statusCode = 404; // Not Found
                    res.end('Resource not found!');
            }
        } else {
            res.statusCode = 404; // Not Found
            res.end('Route not found!');
        }
    });
});

// Function to create a new user
function createUser(res, userData) {
    const { username, password } = userData;
    // Validation checks (e.g., username uniqueness, password strength)
    if (users[username]) {
        res.statusCode = 400; // Bad Request
        res.end('Username already exists!');
        return;
    }
    users[username] = { password, loanedBooks: [] };
    res.statusCode = 201; // Created
    res.end('User created successfully!');
}

// Function to retrieve information about all users
function getAllUsers(res) {
    // Prepare an array to store user information (without passwords)
    const userInfos = [];
    for (const username in users) {
        userInfos.push({ username }); // Include only username for basic user info
    }
    res.statusCode = 200; // OK
    res.setHeader('Content-Type', 'application/json'); // Set response content type
    res.end(JSON.stringify(userInfos)); // Send JSON response with user info
}


// Function to authenticate a user (assuming basic authentication)
function authenticateUser(res, username, loginData) {
    const { password } = loginData;
    if (!users[username] || users[username].password !== password) {
        res.statusCode = 401; // Unauthorized
        res.end('Invalid username or password!');
        return;
    }
    // Successful authentication logic (e.g., sending a session token)
    res.end('Authentication successful!');
}

// Function to create a new book
// Function to create a new book
function createBook(res, bookData) {
    const { title, author, available = true } = bookData;
    // Validation checks (e.g., required fields)
    books.push({ title, author, available });
    res.statusCode = 201; // Created
    res.end('Book created successfully!');
}

// Function to delete a book
function deleteBook(res, bookId) {
    const bookIndex = books.findIndex((book) => book.id === bookId); // Assuming book has an ID property
    if (bookIndex === -1) {
        res.statusCode = 404; // Not Found
        res.end('Book not found!');
        return;
    }
    books.splice(bookIndex, 1);
    res.statusCode = 200; // OK
    res.end('Book deleted successfully!');
}

// Function to loan out a book
function loanOutBook(res, bookId, userData) {
    const { userId } = userData; // Assuming data contains user ID
    const bookIndex = books.findIndex((book) => book.id === bookId);
    if (bookIndex === -1) {
        res.statusCode = 404; // Not Found
        res.end('Book not found!');
        return;
    }
    if (!books[bookIndex].available) {
        res.statusCode = 400; // Bad Request
        res.end('Book is not currently available!');
        return;
    }
    if (!users[userId]) {
        res.statusCode = 400; // Bad Request
        res.end('Invalid user ID!');
        return;
    }
    books[bookIndex].available = false;
    users[userId].loanedBooks.push(bookId);
    res.statusCode = 200; // OK
    res.end('Book loaned out successfully!');
}

// Function to return a book
function returnBook(res, bookId, userData) {
    const { userId } = userData; // Assuming data contains user ID
    const bookIndex = books.findIndex((book) => book.id === bookId);
    if (bookIndex === -1) {
        res.statusCode = 404; // Not Found
        res.end('Book not found!');
        return;
    }
    if (books[bookIndex].available) {
        res.statusCode = 400; // Bad Request
        res.end('Book is already available!');
        return;
    }
    const userIndex = users[userId].loanedBooks.indexOf(bookId);
    if (userIndex === -1) {
        res.statusCode = 400; // Bad Request
        res.end('User has not borrowed this book!');
        return;
    }
    books[bookIndex].available = true;
    users[userId].loanedBooks.splice(userIndex, 1);
    res.statusCode = 200; // OK
    res.end('Book returned successfully!');
}

// Function to update book details (assuming basic update)
function updateBook(res, bookId, bookData) {
    const bookIndex = books.findIndex((book) => book.id === bookId);
    if (bookIndex === -1) {
        res.statusCode = 404; // Not Found
        res.end('Book not found!');
        return;
    }
    // Update specific properties based on bookData (e.g., title, author)
    books[bookIndex] = { ...books[bookIndex], ...bookData }; // Update existing book object
    res.statusCode = 200; // OK
    res.end('Book details updated successfully!');
}

// Start the server
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

