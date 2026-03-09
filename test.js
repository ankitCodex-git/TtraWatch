import sanitizeHtml from 'sanitize-html';
console.log(sanitizeHtml('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=5s', { allowedTags: [], allowedAttributes: {} }));
