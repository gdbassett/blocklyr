---
title: "Blast Radius"
date: 2023-03-24T16:00:00+06:00
image: images/blog/169089178_a_probability_subspace.png
feature_image: images/blog/169089178_a_probability_subspace.png
author: Gabriel Bassett
---


# Blast Radius

In information security we talk a lot about risk.  We talk a lot about likelihood.  We don't talk as much about impact.  It's usually somethinging based on the value of the asset or similar previous breaches.

One thing we're not good at is understanding resilience, or the other side of the same coin, blast radius.  If an anomalous change occurs in one entity, what other entities will experience a change because of that.  Frankly, it's a hard question.  Systems are horribly complex and with even more complex dynamics.

Still, there might be a way.  [Research from the intersection of social science and graph theory](https://www.accelnet-multinet.org/talks/marton-karsai-and-sara-venturini) points to the idea of weighted event graphs, where each node is an event, and an edges connect events happening within a time window that involved one or more of the same assets.  The research then takes this graph and borrows directed percolation from physics to determine how a change in one entity might negatively effect other entities (since we know which entities are involved in each node).

WHile the research didn't envision this, we can imagine the events being netflows or human-machine interactions and the entities being computers  or people.  If that's the case, we can use our netflows and our logs to build the weighted event graph and then test out how changes effecting one entity (the  compromise of  a person's account, the failure of a computer, etc) would effect other systems.

Using this approach we can get start to understand the impact beyond our assets, onto our systems, processes, and ultimately our objectives.