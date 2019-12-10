Title: What is MongoDB?
Date: 2019-05-03 06:30
Category: Software Development, Data Science
Author: Jack McKew
Tags: database, mongodb
Slug: what-is-mongodb
Status: published

Recently after looking for a different flavour of database apart from MySQL (which is what I am personally use to), I had always heard about MongoDB. So after some investigation, I found that MongoDB has a platform MongoDB University to familiarize yourself with their product.

I completed their very first introductory course M001: MongoDB Basics last week, I found it very gentle in the introduction to database management and exploring data sets. This post is dedicated my take on the course and the key takeaways from my point of view.

The course is broken into multiple chapters in which a chapter is released each week for the duration of the course. For example, the basics course was broken up into:

-   Intro to MongoDB, Mongo Compass and Basic Queries,
-   Create, Read, Update and Delete (CRUD) operations and more,
-   MongoDB queries.

Following all the chapters, you are faced with a final exam which tests if you were participating/listening in the earlier chapters. If you are concerned that you may struggle, this final exam is made up of a few multiple choice questions based on querying the data sets used in the chapters.

MongoDB is a open source document-oriented database program, classified as a NoSQL database and utilises JSON-like documents with a schema. They also provide a tool to help sift through the database called 'Compass'.

Personally, I really enjoy the functionality within Compass with plotting geographical data, presenting data type variances across the fields in a document and many other features. I found Compass one of the most appealing features as someone that constantly seeks to gain insight from data.

Queries within MongoDB are structured like a dictionary in Python, where the field in the document is passed the key and the criteria is the value. For example, a basic query to return all documents within a MongoDB database with score equal to 7 would be:

``` python
{score:7}
```

As a mainly Python developer, I found this to be very appealing as I find myself using dictionaries constantly when writing Python code, and by MongoDB using this format makes for an easy connection between the two.

CRUD operations, are the fundamentals on actually using a database usefully. Through the Mongo shell you are able to add documents to the MongoDB database through JSON, XML, etc data formats.

Projections within MongoDB are used to specify or restrict the fields to return with the filtered documents if you are specifically looking at a few fields within a densely populated document.

In addition to the way queries are structured for filtering documents, it is also possible to use one of the many query or projection operators to further filter the documents. For example a query to return all documents with a score **greater than** 7 would be:

``` python
{score: {$gte: 7}}
```

This sums up all of the takeaways from the M001 course for MongoDB that I found. I look forward to taking more of the courses on MongoDB university to gain a greater understanding and be able to utilise MongoDB across some of my projects.
