Title: Redwood JS - The Full-Stack Framework That Almost Convinced Me
Date: 2026-03-10
Author: Jack McKew
Category: Software
Tags: redwoodjs, fullstack, javascript, graphql, prisma

I've been building full-stack apps in JavaScript for years, and the pattern is always the same: separate frontend repo, separate backend repo, maybe share some types if you're organized. Nice for team scalability, annoying for side projects. I want to build fast. Separate repos slow me down.

Redwood promises monorepo bliss - frontend, backend, and database schema all in one repo with a clean abstraction. I spent a weekend kicking the tires to see if it actually delivers.

The setup is stupidly easy:

```bash
yarn create redwood-app my-app
cd my-app
yarn rw dev
```

After a minute, you've got a full-stack dev environment. Frontend hot-reloads on port 8910, API on 8911, database ready. I was genuinely impressed.

The structure is opinionated but reasonable:

```
web/                    # Frontend (React)
  src/pages/            # Next-style pages
  src/components/       # React components
  src/layouts/          # Layout wrappers
api/                    # Backend (Node.js)
  src/graphql/          # GraphQL resolvers
  src/services/         # Business logic
  src/lib/              # Utilities
scripts/                # Database stuff
schema.prisma           # Database schema (Prisma)
```

You define your database schema in Prisma:

```prisma
model Post {
  id        Int     @id @default(autoincrement())
  title     String
  body      String
  published Boolean @default(false)
  author    User?   @relation(fields: [authorId], references: [id])
  authorId  Int?
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}
```

Run `yarn rw db push` and it handles migrations. Then you generate GraphQL:

```bash
yarn rw g sdl post
```

This scaffolds a GraphQL SDL file and resolvers:

```graphql
type Post {
  id: Int!
  title: String!
  body: String!
  published: Boolean!
  author: User
}

type Query {
  posts: [Post!]! @skipAuth
  post(id: Int!): Post @skipAuth
}

type Mutation {
  createPost(input: CreatePostInput!): Post! @requireAuth
  updatePost(id: Int!, input: UpdatePostInput!): Post! @requireAuth
  deletePost(id: Int!): Post! @requireAuth
}
```

And the resolver boilerplate just exists. You fill in the logic:

```javascript
export const posts = () => {
  return db.post.findMany()
}

export const post = ({ id }) => {
  return db.post.findUniqueOrThrow({ where: { id } })
}

export const createPost = ({ input }) => {
  return db.post.create({ data: input })
}
```

The magic is that your frontend can query this GraphQL automatically. Redwood generates TypeScript types for your queries:

```typescript
import { gql } from '@apollo/client'

const POSTS_QUERY = gql`
  query GetPosts {
    posts {
      id
      title
      body
      published
    }
  }
`

export const metadata = () => ({
  title: 'Posts',
  description: 'List of posts'
})

export default function PostsPage() {
  const { data, loading } = useQuery(POSTS_QUERY)

  if (loading) return <div>Loading...</div>

  return (
    <ul>
      {data.posts.map(post => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

This is where Redwood gets interesting. Your backend and frontend are in the same repo. Your schema lives in one place. Changes to the schema can propagate changes everywhere. In theory, you never have an API contract mismatch because there's only one contract.

The "cells" abstraction is clever. It's a wrapper that handles loading, success, and error states:

```javascript
// posts.tsx
import { QUERY } from 'web/src/components/PostCell'

export const QUERY = gql`
  query GetPostCell($id: Int!) {
    post(id: $id) {
      id
      title
      body
    }
  }
`

export const Loading = () => <div>Loading...</div>
export const Error = ({ error }) => <div>Error: {error.message}</div>
export const Success = ({ post }) => (
  <article>
    <h1>{post.title}</h1>
    <p>{post.body}</p>
  </article>
)
```

Then use it:

```typescript
import PostCell from 'web/src/components/PostCell'

export default function PostPage() {
  return <PostCell id={1} />
}
```

It's slick. One component encapsulates the async lifecycle plus UI states. Less boilerplate than Redux, less fiddly than useQuery hooks.

The auth system is integrated too. You add an auth provider (Auth0, Supabase, custom), define roles, use `@requireAuth` in your GraphQL:

```graphql
type Mutation {
  createPost(input: CreatePostInput!): Post! @requireAuth(roles: ["admin"])
}
```

And check in React:

```typescript
import { useAuth } from 'web/src/auth'

export default function AdminPanel() {
  const { currentUser, hasRole } = useAuth()
  if (!hasRole('admin')) return <div>Not allowed</div>
  return <div>Admin stuff</div>
}
```

Here's where I started getting frustrated: it's opinionated to a point where if you want to deviate, you're fighting it. Redwood assumes GraphQL. What if you want REST endpoints? Possible but not encouraged. It assumes Apollo Client. What if you prefer React Query? Doable but you're configuring against the framework.

The deployment story is fine but not great. Redwood apps run on Vercel or Netlify cleanly. The API is Node, frontend is static (mostly), works with serverless. But you're tied to their recommended hosting. Deploying to AWS directly is possible but underdocumented. Deploying to your own servers is technically possible but feels like fighting the framework.

I also hit a limitation with the database. Prisma is great, but Redwood assumes you're using a SQL database with Prisma. NoSQL? Not supported. Custom database layer? Not really how they work. It's a full-stack assumption that might not fit all projects.

The DX is genuinely excellent though. Hot-reload works. Generate commands save actual time. The monorepo setup means I'm not juggling three separate development environments. Running one `yarn rw dev` and having everything work is underrated.

I built a small project (blog with admin panel) to real completion. Schema -> migrations -> GraphQL -> frontend. Took maybe 3 hours. In a traditional setup (separate frontend/backend, manual API integration), this would have been 5-6 hours. Redwood saved time, and more importantly, saved me from the "wait, did the backend change match what I coded?" problem.

The honest take: Redwood is great for greenfield projects where you're comfortable with their assumptions. If you're building a fairly standard web app (CRUD with auth, database-backed), Redwood is legitimately one of the fastest ways to ship. The abstraction is clean, the tooling is good, the DX is a 9/10.

But it's not the universal framework some make it out to be. You're buying into GraphQL, Apollo Client, Prisma, Vercel/Netlify as targets. If any of those don't fit your use case, Redwood becomes friction.

For side projects where I want to ship fast? Redwood is now my default. For complex systems where I need flexibility? Still probably separate repos with something like tRPC instead.

The wild thing is that Redwood proves the monorepo model works for full-stack apps. If they'd opened up the opinions a bit more, allowed REST routes, allowed alternative databases, they'd have something truly special. As is, it's a great framework for a specific kind of project - which is actually fine.