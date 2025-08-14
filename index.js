import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for blog posts
let posts = [];
let postIdCounter = 1;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes

// Home page - Display all posts
app.get('/', (req, res) => {
    res.render('index', { posts: posts });
});

// Create new post page
app.get('/create', (req, res) => {
    res.render('create');
});

// Handle post creation
app.post('/create', (req, res) => {
    const { title, content, author } = req.body;
    
    if (title && content) {
        const newPost = {
            id: postIdCounter++,
            title: title.trim(),
            content: content.trim(),
            author: author ? author.trim() : 'Anonymous',
            dateCreated: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        };
        
        posts.unshift(newPost); // Add to beginning of array
        res.redirect('/');
    } else {
        res.render('create', { error: 'Title and content are required!' });
    }
});

// View single post
app.get('/post/:id', (req, res) => {
    const postId = parseInt(req.params.id);
    const post = posts.find(p => p.id === postId);
    
    if (post) {
        res.render('post', { post: post });
    } else {
        res.status(404).render('404');
    }
});

// Edit post page
app.get('/edit/:id', (req, res) => {
    const postId = parseInt(req.params.id);
    const post = posts.find(p => p.id === postId);
    
    if (post) {
        res.render('edit', { post: post });
    } else {
        res.status(404).render('404');
    }
});

// Handle post update
app.post('/edit/:id', (req, res) => {
    const postId = parseInt(req.params.id);
    const { title, content, author } = req.body;
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex !== -1 && title && content) {
        posts[postIndex] = {
            ...posts[postIndex],
            title: title.trim(),
            content: content.trim(),
            author: author ? author.trim() : posts[postIndex].author,
            dateUpdated: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        };
        res.redirect('/');
    } else {
        const post = posts.find(p => p.id === postId);
        if (post) {
            res.render('edit', { post: post, error: 'Title and content are required!' });
        } else {
            res.status(404).render('404');
        }
    }
});

// Delete post
app.post('/delete/:id', (req, res) => {
    const postId = parseInt(req.params.id);
    posts = posts.filter(p => p.id !== postId);
    res.redirect('/');
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('404');
});

// Start the server
app.listen(PORT, () => {
    console.log(`BlogMode server is running on http://localhost:${PORT}`);
});