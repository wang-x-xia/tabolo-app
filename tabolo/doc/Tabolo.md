# Tabolo

(The doc is translated by AI)

## Why Create Tabolo?

Throughout my career in software development, I have always played the role of a "troubleshooter".
I enjoy problem-solving, and once I solve a problem, I feel a great sense of accomplishment.
In the process, I gain valuable insights into software design and what makes good software versus bad software.
This has earned me recognition from my superiors, and few have questioned my technical abilities in my past work experiences.

However, since the rise of AIGC, I have found it play well as a technical expertise.
I have started shifting my focus towards technical management, although I won't delve into the topic of AIGC replacing programmers at this moment.
As I transition into a leadership role, I have encountered a problem: I struggle to empower my team.

This problem manifests in several ways:

1. New team members lack initiative. When faced with poorly-maintained code, it is difficult for them to find motivation for in-depth research unless they have a strong passion for it.
2. Consequently, it becomes challenging to understand what my colleagues don't know or understand. Consensus is difficult to reach on some fundamental issues.
3. During the acceptance phase, especially during code reviews, conflicts arise due to code smells.

These issues have become even more prevalent recently, and they may not always be well-intentioned.
As the economic environment worsens, the concept of "defensive programming" has become more widespread, 
with programmers mastering the art of writing poor-quality code.
They employ various tactics to protect their jobs, such as resisting automation.
While I understand this sense of crisis, I still believe that stagnation is not a good ideology in the face of progress.

Based on these circumstances, I hope for a **knowledge management** application.
In my imagination, this application should possess the following characteristics:

1. It should be **self-explanatory**. A self-explanatory application can integrate more deeply and transparently with AIGC in the future.
2. It should have **minimal, clear abstractions**. Abstractions help third parties integrate quickly.
3. It should be **visual**. Software without a user interface is challenging to popularize.

This is the background behind the creation of Tabolo.

Of course, you may wonder, what does knowledge management have to do with these three characteristics?

## Self-explanatory of Tabolo

In Tabolo, the goal of **self-explanatory** is multifaceted:

1. **Configurable**: Customization of the application can be achieved through configuration files.
2. **Reusability**: Two different users can share the same configuration file to achieve the same experience.
3. **Understandability**: Configuration files do not employ any magic and their data is comprehensible.

To provide an example, think of Grafana's Dashboards, which are represented using a specific schema in JSON.

This means that any feature in Tabolo requires a corresponding data model, and all of this ultimately becomes part of Tabolo's knowledge.

At this point, a more suitable example becomes the Virtual DOM model used by React.
This model provides an abstraction that is not limited to a specific application.
Any third-party software, such as Preact, can also implement the Virtual DOM.
This promotes freedom and open-source collaboration.
Moreover, it allows the development of a thriving ecosystem and helps Tabolo maintain its distinctiveness and position as described in the second point: **Minimal, Clear abstractions**.

## Minimal, Clear Abstractions in Tabolo

For Tabolo, or rather for knowledge management, I have been contemplating which data types to use.
Although I have more ambitious ideas, for Tabolo, I chose a relatively easy-to-understand model: Graph.

Therefore, in the project, you will see two concepts that seem to have been borrowed from Neo4j, and in earlier commits, the abstractions were directly derived from Neo4j.

In Tabolo, the two most important concepts are Nodes and Relationships.

Nodes and Relationships are basic in Graph. Both definitions include an ID, a type, and properties.
The only difference from Neo4j is that in Tabolo, a Node only has one type (the reasons behind this design will be explained in the future).

The advantage of these two abstractions is that they can easily represent data structures widely encountered in real production activities.
For example, in the case of RDBMS, each table can correspond to a Node type, and if there are foreign key relationships, an attribute-less Relationship can be added.

Of course, when it comes to specific scenarios, distinguishing and splitting Nodes and Relationships remains a complex issue.
However, this simplest abstraction helps build a more complex ecosystem:

1. You can integrate with Kubernetes, mapping each resource to a Node and each owner reference to a Relationship.
2. You can integrate withKafka, mapping each event to a Node.
3. You can integrate with Wikipedia, mapping each document to a Node and linking related documents with Relationships.

With these minimal, clear abstractions, Tabolo can accommodate a wide range of use cases and provide a flexible foundation for knowledge management.

## Visual Nature of Tabolo

The **visual** nature of Tabolo is evident in its user interface.
A user can explore and interact with the knowledge graph in a visual way, making it easier to understand relationships and connections between nodes.

The user interface of Tabolo is designed to be intuitive and user-friendly, allowing users to navigate and explore the knowledge graph effortlessly. 
Users can visualize the connections between nodes, view properties, and perform various operations such as creating, editing, and deleting nodes and relationships.

The visual nature of Tabolo extends beyond the user interface. 
Tabolo also provides visualization capabilities for the knowledge graph itself. 
Users can generate visual representations of the graph, such as graphs or diagrams, to gain a broader understanding of the data and its relationships.

Visualization plays a crucial role in knowledge management as it helps users make sense of complex information and discover patterns and insights that may not be immediately apparent in raw data.
By providing visual representations of the knowledge graph, Tabolo empowers users to explore and analyze the data more effectively.

## Conclusion

Tabolo is a knowledge management application designed to address the challenges faced by technical leaders and teams.
Its self-explanatory nature, minimal and clear abstractions, and visual interface make it a powerful tool for managing and exploring knowledge.
With Tabolo, teams can collaborate more effectively, understand complex systems, and make informed decisions based on a comprehensive understanding of their data.