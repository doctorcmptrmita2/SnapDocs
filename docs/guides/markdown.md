---
title: Markdown Guide
description: Supported markdown syntax and extensions
order: 1
---

# Markdown Guide

SnapDoc supports GitHub Flavored Markdown (GFM) plus additional features.

## Basic Syntax

### Headings

```markdown
# Heading 1
## Heading 2
### Heading 3
```

### Text Formatting

```markdown
**Bold text**
*Italic text*
~~Strikethrough~~
`Inline code`
```

**Bold text**, *Italic text*, ~~Strikethrough~~, `Inline code`

### Links

```markdown
[Link text](https://example.com)
[Internal link](/docs/getting-started)
```

### Images

```markdown
![Alt text](https://example.com/image.png)
```

## Code Blocks

SnapDoc uses Shiki for syntax highlighting with 150+ languages.

### JavaScript

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}

greet('World');
```

### TypeScript

```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = async (id: string): Promise<User> => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
};
```

### Python

```python
def fibonacci(n: int) -> int:
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print(fibonacci(10))
```

### Bash

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Tables

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |
```

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

## Lists

### Unordered

```markdown
- Item 1
- Item 2
  - Nested item
  - Another nested
- Item 3
```

- Item 1
- Item 2
  - Nested item
  - Another nested
- Item 3

### Ordered

```markdown
1. First item
2. Second item
3. Third item
```

1. First item
2. Second item
3. Third item

### Task Lists

```markdown
- [x] Completed task
- [ ] Incomplete task
- [ ] Another task
```

- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

## Blockquotes

```markdown
> This is a blockquote.
> It can span multiple lines.
```

> This is a blockquote.
> It can span multiple lines.

## Horizontal Rule

```markdown
---
```

---

## Frontmatter

Every page can have YAML frontmatter:

```yaml
---
title: Page Title
description: Page description for SEO
order: 1
icon: book
---
```
