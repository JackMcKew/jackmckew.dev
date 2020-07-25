Title: Book Review: The Pragmatic Programmer
Date: 2020-05-xx
Author: Jack McKew
Category: Software, Book Reviews
Tags: software, bookreview

The Pragmatic Programmer is heiled as one of the must-reads for all developers and is extremely well known. It is comparable to a hand book full of tips and tricks to develop more robust software, and also introduces lots of concepts throughout that can be used to improve the development workflow as it evolves for projects. Thus here are my key takeaways, I strongly believe that this is a book you read once, learn a stack from and when you revisit it with more experience down the line, you'll learn even more.

> This review is based on the 20th anniversary edition of the book.

Most of the points below relate to specific chapters/sections.

## Soft Skills

While software development is a technical role, soft skills are still one of the most paramount traits in effective developers and working with others in any scenario. No matter what you do, if you are an effective communicator, this will make you much more valuable in any context.

Skills for being an effective communicator include:

- Active Listening
- Collaboration
- Presentation of Ideas
- Teamwork
- Adaptability
- Conflict Resolution

## Know When to Stop

*Great software today is often preferable to perfect software tomorrow.*

When building software, it is often tempting to think *gee this feature would be better if I just added this*, then chasing that feature down a rabbit hole and suddenly the day is over. By doing this, it is potentially delaying the software from potentially being used by the end user. 

## DRY Principle

*Don't repeat yourself.*

There are many ways information can be duplicated throughout a project, this presents a problem when you need to change that piece of information. By having a single, unambiguous representation means changes can be much more easily handled, and as we all know change is inevitable.

There are multiple types of duplication:

- **Imposed duplication** - Developers feel they have no choice—the environment seems to require duplication.
- **Inadvertent duplication** - Developers don't realize that they are duplicating information.
- **Impatient duplication** - Developers get lazy and duplicate because it seems easier.
- **Interdeveloper duplication** - Multiple people on a team (or on different teams) duplicate a piece of information.

## Orthogonality

Two or more things are orthogonal if changes in one don't affect the others. By writing orthogonal code & developing orthogonal systems, the benefits ripple throughout the entire project.

Some of the benefits include:

- Changes are now localised
- Promotes reuse of existing code
- Allows for more combinations of existing modules
- Bugs are now contained & isolated
- Functionality can be divided for working with multiple teams
- Easier to test

## Tracer Design

Whenever a project begins, knowing what it'll need to do and the requirements by the end of the project is extremely difficult to know; with change also being evitable the first thoughts for requirements may not be the same by the end. The name tracer design comes from tracer bullets, which are bullets used that light up so that the shooter can readjust their aim until they're on target; the same concept can be applied to design. This also brings the end-users into the design process by giving them early access to a working product.

Some of the benefits include:

- Users get to see/use something early on
- Bugs and requirements can be captured earlier
- Developers get a structure to build upon
- Feel better for seeing progress

Tracer design is different to prototyping, with prototyping a developer is exploring aspects on what may be in the final product. Tracer designs aims to have the code that is being develop be apart of the final product, essentially verifying that the product hangs together and runs as intended.

## Risk in Prototypes being Deployed

When a prototype is presented to the end-user, there is potential for the user to believe it is almost finished or worse finished. Managing the expectations of your users or stakeholders comes back to [Soft Skills](#soft-skills), in that developers need to be effective communicators on informing that this is incomplete and there is much left to go!

## Crash Early

By crashing early, it means the program does a lot less damage than a crippled program. This concept can be implemented by checking for the inverse of the requirement and erroring. By doing this, it means the code is more readable in finding the requirements that it must meet. It captures more potential issues before they cause damage versus checking all the ducks are lined up.

For demonstrating this, we will use the example of a square root function. As we know, square root wants to have a positive number given to it (unless using complex numbers).

``` python
def sqrt(value):
    if value < 0:
        raise ValueError("Value must be positive to get the square root")

    return value ** 0.5
```

By doing this, we enable the function to potentially raise an error, multiply by -1 or even append an *i* for complex numbers. Another example of this is, before querying a database check if there isn't a connection to the database and raise an error rather than checking if the connection is established (thus making for quite the nested beast sometimes).

## Design by Contract

A correct program does no more and no less then what it claims to do. Ensure conditions (both pre & post) are met before anything begins, and promise as little as possible in return. This also helps enforcing [Crash Early](#crash-early), by verifying conditions have been satisfied, enables developers to crash the program if anything is unsatisfactory.

## Build End to End

There are many ways when it comes how something is built. More commonly things are viewed upon as being top-down or bottom-up. Top down is when we define the problem statement and break it down into smaller actionable chunks until it's pieced together. Bottom up is when we build more amd more of the smaller actionable pieces and plan to join them all together to meet the requirements in the future (very helpful when the problem isn't well defined).

Rather than either of these, if we look through the perspective of building things end-to-end this can be a more holistic methodology. Which can also be adopted with either of the prior methodologies mentioned beforehand ensuring to build complete pipelines which can be combined or amended later on in development when the problem is further understood.

## Debugging

Don't assume how a bug occurred, prove it. This is also a fantastic practice to tie in with testing, by discovering a bug, determine how it was created and then prove that's how the bug occurred. This brings the workflow into:

- Bug occurs
- Find out why/how the bug occurred
- Prove that's how it occurred
- Add it to the test suite to ensure the bug never occurs again

