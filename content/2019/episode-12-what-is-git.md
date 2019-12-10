Title: Episode 12 - What is Git?
Date: 2019-02-08 06:30
Category: Software Development
Author: Jack McKew
Tags: software, git
Slug: episode-12-what-is-git
Status: published

One of the biggest issues when working on any project regardless of what industry, discipline or context, as soon as a new 'version' of design or update comes along, the issue of version control appears. When this change(s) come along in the life cycle of a project, it is within everyone involved's best interests to maintain some type of version control, to manage and track changes between versions.

When it comes to software development version control, the most well-known and commonly used system is Git. Git is a actively maintained open source project originally developed by Linus Torvalds (creator of the Linux OS kernel) in 2005. Multitudes of software projects depend on git for version control, including both commercial and open source.

Git has a distributed architecture, meaning rather than having one single location for the full version history of the project, every developer's working copy of the project is also a location that can contain the full history. This also comes with the benefit that if one developer happens to lose the entire project, it can be restored from other developers (pending they have/are working on the latest version).

### Flexibility

Git is flexible in several respects: efficiency at maintaining version control for both small and large projects, capable at handling numerous types of non-linear development workflows and compatibility with existing protocols and systems.

Git supports branching and tagging (unlike other commonly used version control systems), and operations that affect branches and tags such as reverting or merging are stored as part of the change history. This level of tracking is not available in many other version control systems.

### Security

The integrity of the source code of the project was identified as a top priority when Git was design. Cryptographically secure hashing algorithms are used to secure: file contents, file and directory relationships, versions, tags and commits. This defends the project's source files and change history against both malicious and accidental changes and ensures that all modifications is fully traceable.

### Use-case

Bob wants to implement a new feature to the project he is working on in anticipation of the upcoming 3.0 release, and commits the new feature with descriptive messages. After being inspired by the new feature, he works on a second new feature and commits those modifications as well.

Naturally, these two new features are logged as separate entities within the change history of the project. Bob then returns back to version 2.6 of the same project to fix a problem that only affects version 2.6. This allow Bob (and his team) to distribute that fix release (version 2.6.1), before version 3.0 is ready.

Bob can then return to the upcoming version 3.0 'branch' to continue implementing new features. Since Bob has his own copy of the entire project, all of these changes can occur without an network access, thus being reliable and fast. To submit all these committed features and fixes to the remote copy of the project, it simply done by the use of the 'push' command.
