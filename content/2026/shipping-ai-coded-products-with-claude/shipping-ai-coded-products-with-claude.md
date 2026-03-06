Title: Shipping Real Products with Claude Code (No Team Required)
Date: 2026-03-06
Author: Jack McKew
Category: Software
Tags: ai, claude, astro, side-project, automation

After [building the First Home Buyer Guide](https://jackmckew.dev/building-a-first-home-buyer-guide-that-actually-helps.html), I wanted to see how far I could push this approach. Not just one product - a repeatable system where I describe what I want, and AI does the actual coding, testing, and deployment. Three products later, here's what I've learned about using Claude Code to ship software solo.

## The products

Quick context on what I've actually shipped with this system:

- [First Home Calculator](https://firsthomecalculator.com.au) - Australian first home buyer calculator with grants, stamp duty, FHSS scheme. 38 SEO pages. $9 one-time.
- [YT Script Kit](https://yt-script-kit.pages.dev) - AI script prompt templates for faceless YouTube channels. 50+ templates across 5 niches. $29 one-time.
- [AI Product Builder](https://ai-product-builder-2ay.pages.dev) - The system itself, packaged as a product. Templates, frameworks, deployment pipelines. $99 one-time.

All three are live, taking payments, and were built without me writing a single line of code manually.

## The stack (and why it's deliberately boring)

Every product uses the same stack:

```
Astro 5          - Static site generation (zero JS by default)
Plain CSS        - Custom properties for theming, no Tailwind
Cloudflare Pages - Free hosting, auto-deploy from GitHub
Stripe           - Payment Links (no backend needed)
```

The reason I chose this stack isn't performance (though it is fast). It's AI-maintainability. Claude Code handles plain CSS better than Tailwind utility classes. Static sites mean no server state to debug. Stripe Payment Links mean no checkout backend.

```bash
# The entire deployment pipeline
npm run build          # Astro builds static HTML
git push origin main   # GitHub Actions triggers
# Cloudflare Pages deploys automatically - done
```

Hosting costs: $0/month across all three products. Cloudflare's free tier is absurdly generous.

## The CLAUDE.md file - this is the real product

The thing that makes this work isn't Claude Code itself - it's the instructions file. Every product has a `CLAUDE.md` that tells the AI agent how to behave. Here's a stripped-down version:

```markdown
# Product Name

## What This Is
One paragraph description.

## Tech Stack
- Astro 5 (static only)
- Plain CSS with custom properties
- Cloudflare Pages hosting

## Pricing
- $29 AUD one-time (Aspirin tier)

## AI Agent Notes
- No em dashes - use regular hyphens
- Dark mode via [data-theme="dark"]
- Never commit .env files
- Run tests after changes
- Keep files under 500 lines
```

That `No em dashes` rule is worth explaining. Em dashes are an AI telltale - real humans use hyphens. I wrote a pre-commit hook that catches them:

```bash
#!/bin/bash
# Check for em dashes in source files
if grep -rn $'\xe2\x80\x94' src/ --include="*.astro" --include="*.ts" 2>/dev/null; then
  echo "Em dashes found - use regular hyphens instead"
  exit 1
fi
```

It's a small thing but it matters when your entire site is AI-generated.

## Setting up Stripe with zero backend code

One of the things that surprised me was how simple payments are now. No checkout page, no webhook handler, no server at all. Stripe Payment Links handle everything.

```bash
# Create the product
curl -X POST "https://api.stripe.com/v1/products" \
  -u "$STRIPE_SECRET_KEY:" \
  -d "name=YT Script Kit" \
  -d "description=AI script prompt templates for YouTube"

# Create a price ($29 AUD)
curl -X POST "https://api.stripe.com/v1/prices" \
  -u "$STRIPE_SECRET_KEY:" \
  -d "product=prod_XXXXX" \
  -d "unit_amount=2900" \
  -d "currency=aud"

# Create a payment link that redirects to your success page
curl -X POST "https://api.stripe.com/v1/payment_links" \
  -u "$STRIPE_SECRET_KEY:" \
  -d "line_items[0][price]=price_XXXXX" \
  -d "line_items[0][quantity]=1" \
  -d "after_completion[type]=redirect" \
  -d "after_completion[redirect][url]=https://yoursite.com/success?paid=true"
```

The response gives you a `buy.stripe.com` URL. Drop it in your buy button's `href`. That's the entire payment integration.

```html
<a href="https://buy.stripe.com/your-link-here" class="buy-button">
  Get the Kit - $29
</a>
```

No Stripe.js, no server-side session, no webhook to verify payment. For digital products with instant delivery, this is all you need.

## Cloudflare Pages deployment via API

Same deal with hosting. I used to manually create projects in the Cloudflare dashboard. Now I do it with one API call:

```bash
curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects" \
  -H "Authorization: Bearer $CF_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-product",
    "production_branch": "main",
    "build_config": {
      "build_command": "npm run build",
      "destination_dir": "dist"
    }
  }'
```

Then set the GitHub secrets so the deploy workflow can push:

```bash
gh secret set CLOUDFLARE_API_TOKEN -R "org/repo" --body "$CF_API_TOKEN"
gh secret set CLOUDFLARE_ACCOUNT_ID -R "org/repo" --body "$ACCOUNT_ID"
```

From that point on, every `git push` builds and deploys automatically. The GitHub Actions workflow handles the build, runs some validation checks (design system compliance, em dash detection), and deploys via Wrangler.

## The pricing framework

I spent way too long agonising over pricing on the first product before landing on something simple. Three tiers based on how badly the buyer needs it:

| Tier | Price | When to use it |
|------|-------|---------------|
| Vitamin | $9 | Nice to have - calculators, cheat sheets |
| Aspirin | $29 | Solves a real problem - template packs, prompt kits |
| Painkiller | $99 | Can't live without it - complete systems |

The rule that saved me the most time: if a product gets less than 10 sales in month 1, kill it or pivot. No sunk cost fallacy allowed. I've killed two ideas using this rule (Strava automation and Google Keep integration) before writing any code.

## What I'd do differently

Some things I got wrong:

1. **Marketing from day one.** My first product was 90% building, 10% marketing. Should be 50/50. No one knows your product exists unless you tell them.

2. **Free sample on every product.** I added this later but it should've been there from the start. People need to see real output before they'll pay. The [First Home Calculator](https://firsthomecalculator.com.au) shows your full results for free - you only pay for the detailed PDF report.

3. **Cross-sell earlier.** Every product footer now links to every other product. Cross-selling existing customers is 5-8x cheaper than finding new ones. I should've built this into the template from the start instead of retrofitting it.

4. **Blog on every product site.** Each product now has its own blog at `/blog` that grows automatically as I add features. These posts link back here to jackmckew.dev and vice versa. The SEO value of this cross-linking is real.

## The system is the product

The meta realisation was that the system I built to make products - the templates, the CLAUDE.md conventions, the pricing framework, the deployment automation - is itself a product. That's the [AI Product Builder](https://ai-product-builder-2ay.pages.dev). It's $99 because it's the complete system, not a single tool.

If you're thinking about building small software products with AI, the hardest part isn't the coding. It's the system around the coding: what to build, how to price it, how to deploy it, and how to know when to kill it. That's what I've been figuring out, and I'll keep sharing what works (and what doesn't) here.
