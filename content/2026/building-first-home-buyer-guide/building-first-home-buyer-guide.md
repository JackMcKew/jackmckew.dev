Title: Building a First Home Buyer Guide That Actually Helps
Date: 2026-03-05
Author: Jack McKew
Category: Software
Tags: astro, preact, static-site, australia, side-project

I've been watching friends try to buy their first home in Australia and the experience is genuinely confusing. Every state has different grants, different stamp duty rules, different price caps — and most of the information out there is either buried in government PDFs or wrapped in mortgage broker marketing. So I built a tool that cuts through all of it.

[First Home Buyer Guide](https://firsthomebuyerguide.com.au) is a free calculator that tells you exactly what grants, stamp duty savings, and government schemes you qualify for based on your state, income, and property type. It grew from a simple calculator idea into a 38-page site covering everything from pre-approval to a printable buying checklist.

## Why this exists

The trigger was watching someone miss out on the First Home Guarantee because they didn't know the income caps had been removed in October 2025. That's potentially tens of thousands in LMI savings, gone because the information was scattered across three different government websites. Queensland's boosted $30K FHOG expires June 2026 and I'd bet most eligible buyers don't know about it.

The existing tools out there either only cover one state, push you toward a specific lender, or make you fill out a lead form before showing you anything useful. I wanted something that just... works. Enter your details, see your results, done.

## Tech stack: Astro + Preact

I went with [Astro](https://astro.build/) for static site generation with Preact islands for the interactive calculator. The reasoning was simple:

- **38 static pages** load instantly — no JavaScript needed for content pages
- **One interactive island** (the calculator) hydrates with Preact, keeping the bundle tiny
- **Plain CSS** with custom properties — no framework overhead

```javascript
// The calculator is the only interactive component
<Calculator client:load />

// Everything else is static HTML — grants, guides, stamp duty pages
// all rendered at build time with zero JS
```

The `client:load` directive means the calculator JavaScript only loads on the homepage where it's needed. Every other page ships zero JS. Build time for all 38 pages: about 23 seconds.

I briefly considered Next.js but it felt like bringing a cannon to a knife fight. This is a content site with one interactive widget. Astro's island architecture was the perfect fit.

## The iteration loop

The site didn't start as 38 pages. It started as a calculator and a homepage.

What happened next was a persona-driven iteration process — I'd imagine a specific first home buyer (nervous Adelaide renter, budget-conscious regional Victorian, frustrated Sydney renter) and ask: what would this person need that we don't have yet?

That produced:
- A step-by-step buying process guide
- State-by-state grant comparison tables
- An LMI explainer (because most people don't know what it is until they're hit with the bill)
- A "how long to save your deposit" timeline
- A rent vs buy comparison
- A printable 31-item checklist across 6 phases
- A glossary of 26 terms
- Pre-approval walkthrough
- 10 costly mistakes to avoid

Each page has FAQ structured data for Google, cross-links to related content, and breadcrumb navigation. The SEO wasn't an afterthought — every page was built with search intent in mind.

## What surprised me

The biggest surprise was how much the calculator itself evolved. It started as a basic "enter income, see borrowing power" tool. By the end it was calculating stamp duty exemptions per state, showing FHOG eligibility, estimating LMI costs, factoring in the First Home Guarantee and Help to Buy schemes, and generating a downloadable PDF report.

The PDF generation was its own adventure. I started with `@react-pdf/renderer` but it was heavy and didn't play well with Preact. Switched to jsPDF with code-splitting and lazy loading — the PDF code only downloads when someone actually clicks the button. The free snapshot is 4 pages, the paid report is 7 pages with detailed breakdowns.

Another thing I didn't expect: the broker referral system. After building all this content that kept recommending "talk to a mortgage broker," it made sense to actually help people find one. Built a lead capture form that redirects to an affiliate broker platform. It's on the calculator results, pre-approval page, and buying process page — the high-intent spots where someone's most likely to act.

## What I'd do differently

If I started over:
- I'd set up the content page template earlier. The first few pages were hand-crafted, then I found patterns and could move faster
- I'd build the PDF report first, not last — it's the paid product and should've driven the feature set from day one
- The CSS could be tighter. 38 pages of inline styles in Astro templates gets messy. A utility class system would've been cleaner

## Check it out

The calculator is live at [firsthomebuyerguide.com.au](https://firsthomebuyerguide.com.au). It's free to use — you can see all your grants, stamp duty savings, and borrowing power without signing up for anything. If you know someone buying their first home in Australia, send it their way.
