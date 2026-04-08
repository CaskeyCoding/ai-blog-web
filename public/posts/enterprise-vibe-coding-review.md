# Book Review: Enterprise Vibe Coding Playbook — Building Real Software with AI

Doug Kerwin's *[Enterprise Vibe Coding Playbook](https://www.amazon.com/s?k=Enterprise+Vibe+Coding+Playbook+Doug+Kerwin)* arrives at a critical inflection point in software development. As organizations wrestle with AI integration, this book cuts through the hype and delivers a pragmatic framework for how real teams actually build real software with AI as a partner—not a replacement.

I approached this book as a skeptic with a vested interest in getting it right. As a senior engineer at Amazon managing a team of engineers building large-scale applications, I've seen firsthand both the transformative potential of AI-assisted development and the organizational resistance that slows adoption. This review is part book critique and part field report from the trenches.

## The Core Thesis: AI as Accelerator, Not Magic

Kerwin's central argument is disarmingly simple but often misunderstood: AI should write most of your code, but you must remain the architect, reviewer, and course-corrector. This stands in sharp contrast to the "vibe coding" strawman that has poisoned discourse around AI-assisted development.

What is vibe coding? Kerwin identifies it as the dangerous assumption that AI writes code without human scrutiny. It's a caricature that has become a convenient shield for skeptics unwilling to adapt. His beef with the term is justified—it misrepresents how AI actually amplifies developer productivity.

The real insight here is that **you're still developing; you're just not writing line-by-line anymore**. Think of it as the difference between describing what needs to happen to your copilot and then refining the result, versus typing every character yourself. The hard thinking, the design, the architectural decisions—these remain yours.

Kerwin crystallizes this with a quote that stayed with me: *"The issue isn't using AI to write all the code. It's pretending you don't need to review, guide, and course-correct."* More pointedly: *"The problem isn't AI writing the code. It's expecting it to get everything right with one shot prompt and no plan. It's skipping the hard thinking, the real design, and expecting magic."*

This resonates deeply with what I'm seeing at Amazon. Teams that are winning with AI haven't abandoned discipline—they've doubled down on it. They're clearer about requirements, more intentional about architecture, and more rigorous about review. The tool accelerates, but the thinking is non-negotiable.

## Why This Matters: A Historical Parallel

When the industry transitioned from relational databases to DynamoDB and NoSQL architectures, we didn't resist the shift. We adapted. We learned new patterns, new trade-offs, new ways of thinking about data. The fundamentals of distributed systems didn't change, but our implementation patterns did.

AI-assisted development is similar. We're not abandoning software engineering principles—we're evolving how we apply them. Context engineering and prompt engineering are emerging disciplines that sit alongside API design and system architecture. AI pipelines and agentic workflows are becoming what data pipelines were to the previous generation: foundational infrastructure.

The era of purely manual writing—in code, in documentation, in planning—should be assumed to be over. The question isn't whether to use these tools, but how to use them wisely.

## The Method: Writing a Book with Cursor and Repository Tracking

One of the most interesting aspects of this book is that Kerwin wrote 100% of it with AI assistance, using Cursor as his IDE and a repository to track his ideas and maintain stylistic consistency. This isn't a book *about* AI-assisted development written in a vacuum. It's a book written *with* the methods it describes.

This approach underscores a critical insight: IDEs, agents, and AI-assisted capabilities aren't just for developers anymore. The same tools and patterns apply across the SDLC stack—to product managers, technical program managers, architects, and yes, even to authors writing about software. The infrastructure of thinking has fundamentally changed.

## The Practical Framework: From Code Generator to Thinking Partner

Chapter 4 dives into prompting, and Kerwin draws a comparison to writing user stories. The analogy is apt: bad prompts are like bad user stories. They're vague, they lack context, and they leave room for misinterpretation. I have personal experience with Kerwin pushing this point during a reorganization at a previous company, and I've seen the exact same problem at Amazon. Engineers and managers consistently under-invest in clarity at the spec stage, then wonder why the output (human or AI) misses the mark.

Good prompts require the same discipline as good user stories: clarity, specificity, constraints, and acceptance criteria. The thinking is harder upfront, but the downstream efficiency is dramatic.

But prompting is just one dimension. Chapter 7 pivots to a broader theme: **how you show up in an AI-driven engineering culture**. Kerwin identifies two archetypes worth watching for:

**The Resident Skeptic:** This person specializes in doubt without building. Kerwin references Amazon's principle of "disagree and commit"—and he's right. If your organization is moving toward AI, constant skepticism doesn't help anyone. It doesn't help your team ship faster. It doesn't help your career. It doesn't help you actually use these tools effectively. Skepticism has its place in design reviews and threat-modeling, but not in paralysis.

**The Expert's Paradox:** Experienced engineers sometimes confine AI to narrow tasks—documentation, simple functions—while refusing to delegate more complex thinking. This self-imposed limitation leaves performance on the table.

## The Unsexy Part: Design and Discipline

Chapter 6 is titled "Design Don't Dive In," and I couldn't agree more. The difference between a hastily assembled codebase and a maintainable system is upfront thinking. With AI, this becomes even more critical. You can use AI as your thinking partner to reason through the user layer, the UI layer, the data layer, the business rules, the edge cases, the data models. You can ask it to challenge your assumptions. But you can't skip the thinking.

Design is the differentiator. AI excels at implementation and iteration, but it cannot replace architectural judgment, domain expertise, or the messy work of understanding constraints.

Kerwin also acknowledges what often gets overlooked: even with AI assistance, the underlying code is often a mess underneath. Shortcuts, glue code, technical debt—these don't disappear. They're just easier to accumulate if you're not disciplined. This reaffirms that using AI to accelerate development doesn't mean lowering standards. It means raising the bar on review and refactoring.

## The Quiet Revolution: Voice and Thinking Out Loud

Chapter 5, "The Power of Voice," made me smirk at first. Speaking to your computer? It felt embarrassing, inefficient, and gimmicky. But after reading Kerwin's take, I gave it a serious try.

I was surprised. Voice-to-transcription technology has improved dramatically, and more importantly, the workflow is genuinely different from typing. Speaking allows you to capture your thoughts at a higher level before editing and refining. It's like a rough draft that forces you to get your ideas out before you polish them. The revision phase comes next—the hard coding, the rewrites, the actual technical work.

I'm not doing this in the office yet (yes, I still feel self-conscious), but I've recommended the approach to others. If more engineers actually tried this, I think adoption would shift quickly. It's a tool for gathering and aggregating thoughts faster than you can type them.

## The Missing Piece: Cultural Adoption

Here's what Kerwin does well but what every team will struggle with: moving from individual productivity to organizational capability. You can be the best AI-assisted developer on your team, but if your organization isn't on board, you'll hit a ceiling.

At Amazon, I've seen both sides. Teams that embrace AI-assisted development with disciplined prompting, strong design practices, and a commitment to review are shipping at a different velocity. Teams that resist are falling behind. The gap widens every quarter.

But adoption is cultural, not technical. It requires skeptics to engage rather than complain. It requires experts to experiment rather than gatekeep. It requires organizations to invest in training people how to prompt, how to design for AI assistance, and how to integrate these tools into their workflows.

## A Complementary Read

If you finish *[Enterprise Vibe Coding Playbook](https://www.amazon.com/s?k=Enterprise+Vibe+Coding+Playbook+Doug+Kerwin)* and want to deepen your understanding of AI's role in leadership and organizational change, I'd recommend *[The AI-Driven Leader](https://www.amazon.com/s?k=The+AI-Driven+Leader+Geoff+Woods)* by Geoff Woods. It builds on the "thinking partner" model that Kerwin introduces and extends it beyond engineering to product, strategy, and organizational design.

## The Verdict

*Enterprise Vibe Coding Playbook* is essential reading for any engineer, tech lead, or manager grappling with AI adoption. It's not a technical manual for prompt engineering (though those insights are there), and it's not a cheerleading manifesto (Kerwin is clear-eyed about the pitfalls). It's a practical, grounded guide to how real teams work with AI as a thinking partner and accelerator.

The book's greatest strength is that it doesn't pretend to have all the answers. Instead, it models the framework: clarify your thinking, use AI to refine it, review rigorously, iterate. That's not just good software development. That's good thinking.

If you're on the fence about AI-assisted development, this book will challenge your assumptions. If you're already using it, it will give you language and frameworks to advocate for broader adoption in your organization. And if your organization is stuck in the vibe coding debates, hand this to the skeptics and the experts alike.

The era of manual writing is over. The question now is whether you'll lead that change or chase it.