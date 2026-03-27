---
name: blog-writer
description: >
  Write SEO-optimized blog posts for OrizPDF and similar projects. Trigger when:
  - User asks to write a blog post, article, or content piece
  - User mentions "blog", "article", "post", "SEO content", or "content marketing"
  - User wants to write about PDF tools, productivity, tutorials, or tech topics
  - User says "write about", "create content for", or "draft a post"
  Use this skill for ALL writing tasks involving blog posts, articles, or long-form content.
---

# Blog Writer Skill

A skill for writing high-quality, SEO-optimized blog posts with proper structure, internal linking, and audience-appropriate tone.

## When to Use

Use this skill whenever the user wants to:
- Write a blog post or article
- Create content for their website or blog
- Draft SEO-optimized content
- Write about PDF tools, productivity, or tech topics
- Generate article ideas or outlines

## Writing Framework

### Step 1: Understand the Request

Clarify these details (in conversation or from context):

1. **Topic**: What's the article about?
2. **Target audience**: Beginners, professionals, developers, general users?
3. **Purpose**: Inform, teach, persuade, entertain?
4. **Length**: Quick post (600-800 words), standard (1000-1500), or in-depth (2000+)?
5. **Tone**: Based on topic type:
   - **Educational/How-to**: Professional & informative
   - **Product updates**: Casual & conversational
   - **Technical deep-dives**: Technical & precise
   - **SEO/Marketing**: Professional with clear value propositions

### Step 2: Research (if needed)

For OrizPDF-specific posts:
- Check `src/data/tools.ts` for available tools and their descriptions
- Review existing pages for consistency
- Understand the site's value proposition (client-side, free, private)

### Step 3: Outline Structure

Every blog post should follow this structure:

```markdown
# [Compelling Title with Primary Keyword]

[Hook paragraph - 2-3 sentences that grab attention and state the problem/value]

## [Section 1: Context/Problem]
[Explain why this matters]

## [Section 2: Solution/How-to]
[Main content - the meat of the article]

## [Section 3: Benefits/Results]
[What the reader gains]

## [Section 4: Tips/Best Practices]
[Actionable advice]

## [Conclusion]
[Summary + CTA - call to action]

---
*Optional: FAQ section for SEO*
```

### Step 4: Write with SEO in Mind

**Title Rules:**
- Include primary keyword near the beginning
- Keep under 60 characters
- Use numbers, power words, or questions
- Examples:
  - ✅ "How to Merge PDFs Online: Free & Private Guide"
  - ❌ "Some Thoughts on PDF Merging"

**First Paragraph:**
- Include primary keyword naturally in first 100 words
- Answer the reader's question immediately
- Don't waste time with filler

**Headings:**
- Use H2 for main sections, H3 for subsections
- Include secondary keywords in headings
- Make headings descriptive and scannable

**Internal Linking:**
- Link to relevant OrizPDF tool pages (e.g., `/tools/merge-pdf`)
- Link to related blog posts
- Use descriptive anchor text, not "click here"

**Keyword Density:**
- Use primary keyword 3-5 times naturally
- Include 2-3 related keywords/LSI terms
- Never stuff keywords - readability first

### Step 5: Write the Article

**Tone Guidelines by Topic Type:**

| Topic Type | Tone | Example Phrasing |
|------------|------|------------------|
| How-to/Tutorial | Professional, clear | "Here's how to merge your PDFs..." |
| Product Features | Enthusiastic, benefit-focused | "You can now merge PDFs without uploading..." |
| Industry Insights | Authoritative, data-driven | "According to recent studies..." |
| Comparison Posts | Balanced, objective | "While both tools offer..." |
| Tips & Tricks | Friendly, actionable | "Pro tip: Always compress before sharing..." |

**Formatting Best Practices:**
- Short paragraphs (2-4 sentences)
- Bullet points for lists
- Bold key terms
- Include code snippets only if technical
- Use tables for comparisons
- Add emojis sparingly (🎯 for tips, ⚠️ for warnings)

**Common Pitfalls to Avoid:**
- Don't start with "In today's digital world..."
- Don't use passive voice excessively
- Don't make claims without backing them up
- Don't ignore the reader's pain points
- Don't write walls of text

### Step 6: Meta Description

Write a compelling meta description (150-160 characters):
- Include primary keyword
- State the value proposition
- End with a call to action or question
- Example: "Learn how to merge PDFs online without uploading your files. Free, fast, and private — all processing happens in your browser."

## Templates

### How-To Article Template

```markdown
# How to [Action] [Object]: [Benefit] | OrizPDF

[Hook: State the problem and promise the solution]

## Why [Action] Matters
[Explain the pain point and why the reader should care]

## Step-by-Step Guide

### Step 1: [First Action]
[Detailed instructions with context]

### Step 2: [Second Action]
[Continue with clear, numbered steps]

### Step 3: [Third Action]
[Wrap up the process]

## Pro Tips
- [Actionable tip 1]
- [Actionable tip 2]
- [Actionable tip 3]

## Common Mistakes to Avoid
- [Mistake 1 and how to fix it]
- [Mistake 2 and how to fix it]

## Conclusion
[Restate value + link to tool]

---
## Frequently Asked Questions

**Q: [Common question]**
A: [Clear, concise answer]

**Q: [Another question]**
A: [Answer with link to related tool if relevant]
```

### Product Feature Template

```markdown
# Introducing [Feature]: [What It Does] | OrizPDF

[Excitement-building opener about the new feature]

## What is [Feature]?
[Clear explanation of what the feature does]

## How [Feature] Works
[Technical but accessible explanation]

## Benefits
- [Benefit 1]
- [Benefit 2]
- [Benefit 3]

## How to Use [Feature]
[Step-by-step instructions]

## What's Next
[Tease upcoming features or improvements]

---
*Try it now: [Link to tool]*
```

### Comparison Article Template

```markdown
# [Tool A] vs [Tool B]: Which is Better for [Use Case]?

[Introduction to the comparison and why it matters]

## Quick Comparison Table

| Feature | [Tool A] | [Tool B] |
|---------|----------|----------|
| [Feature 1] | ✅ | ❌ |
| [Feature 2] | ✅ | ✅ |
| [Feature 3] | ❌ | ✅ |

## In-Depth Analysis

### [Feature 1] Comparison
[Detailed comparison with examples]

### [Feature 2] Comparison
[Continue with other features]

## When to Use Each Tool
- **[Tool A]**: Best for [scenario]
- **[Tool B]**: Best for [scenario]

## Our Recommendation
[Clear recommendation based on use cases]

---
## Frequently Asked Questions
[Address common comparison questions]
```

## Output Format

Always output the final article as a **complete Markdown document** ready to be:
1. Published on a blog
2. Copied into a CMS
3. Saved as a `.md` file

The article should include:
- Title with SEO keyword
- Meta description (in a comment or separate)
- Proper heading hierarchy (H1 → H2 → H3)
- Internal links to OrizPDF tools
- FAQ section for featured snippets
- Clear CTA at the end

## Quality Checklist

Before finalizing, verify:
- [ ] Title includes primary keyword
- [ ] First paragraph hooks the reader
- [ ] All headings are descriptive and scannable
- [ ] Paragraphs are short (2-4 sentences)
- [ ] Internal links are included where relevant
- [ ] Meta description is written (150-160 chars)
- [ ] FAQ section covers common questions
- [ ] CTA is clear and actionable
- [ ] Tone matches the topic type
- [ ] No filler or fluff
- [ ] Proofread for grammar and typos

## Example Usage

**User**: "Write a blog post about how to compress PDFs"

**Output**: A complete 1000-1500 word article following the how-to template, including:
- SEO-optimized title
- Problem/solution hook
- Step-by-step guide using OrizPDF's Compress PDF tool
- Pro tips and common mistakes
- FAQ section
- Meta description
- Internal links to the Compress PDF tool page
