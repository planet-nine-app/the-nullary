# The Nullary

The Nullary (an anglicization of the Latin roots null, meaning nothing, and aris, meaning pertaining to), is a set of apps that provide the absolute bare functionality for existing social media forms.
Those forms are, in no particular order: 

* picture-based - Imagary 

* short-form video - Viewary

* link-aggregator - Prolary

* micro-blogging - Glyphary

* social-graph - Friendary

In addition, there is an app that combines all of these: Screen.

## Overview

These apps are built using [allyabase][allyabase] for a backend, which provides an anonymous way of engaging in social media.
Some of you might be questioning the benfit of anonymous social media, to which I suggest you read [You are not a number][you-are-not-a-number].

Allyabase can be deployed and federated, or not, as "bases" so as to deliver specific content to users of these apps.
Users can join and leave bases at their discretion.
As a base may represent any number of people, people who want people to follow them can do so, but at the same time people who simply want to follow communities can do so as well.
Further categorization is possible through a tagging mechanism similar to how hashtags work around existing apps.

Bases can draw content in from other open sources such as Bluesky and the Fediverse, and offer that to users, or simply maintain their own content, or pull in content from other bases, or any combination of those. 

Users join, leave, mute, and ignore bases, as well as having standard controls for blocking other users.
What will seem _unfamiliar_ is that the Nullary doesn't attach a single paradigm on how to interact with content.
There are ways to interact with posts, but what that interaction means is left to the discretion of the base.

The Nullary is meant to be the base layer for other apps, and perhaps plugins at some point, to be built on top of. 
If seeing those hearts light up is your jam, go right ahead and build that. 
The world is our oyster.

## Interoperability and you

If you're like me, you've spent the last five years or so avidly devouring any and all news for distributed alternatives to centralized systems that a) were in no way associated with cryptocurrencies, and b) were free for users, and monetizable via some mechanism other than advertising.

Chances are you're not like me, so let me give you the tl;dr of all that.

The actual technical mechanics of posting some text, and maybe an image to a database somewhere, and then displaying it to users was no longer earth-shattering in the late 'teens. 
So the w3c, the illuminati of web standards, came up with a protocol called ActivityPub that would allow servers on the distributed internet to share these kinds of posts.
This spawned a number of _different implementations_ of the protocol, which collectively are known as the Fediverse.

A few years later, some engineers from Twitter created the AT Protocol, a protocol that is almost exactly the same conceptually as ActivityPub, but different enough frustrate efforts at distributed social media through fragmentation.
The AT Protocol is used most notably by Bluesky, which has been receiving much of the exodus from Twitter.

The Fediverse and Bluesky are great steps in the right direction, but they're not the solutions we need because of how they treat identity (for a deeper dive on why this is I'll refer you again to [You are not a number][you-are-not-a-number]).

And that's what The Nullary is for.

In the grand scheme of decentralized systems, there are three levels: distributed, federated, and interoperable. 
These three are pretty poorly defined in the tech industry, mostly because it's unclear how to truly do them, and everyone will no true scotsman you when you say your system is one or the other.
For our purposes, we'll consider the following:

Distributed systems have no single owner, and each node has some number of users who interact with the node, but the code on each node is the same.
In federated systems, the nodes themselves connect via some set of protocols, but can do different things based on what they want to do.
Interoperable systems are ones where the user can connect and have the same experience _regardless of what any other part of the system is doing_.

Interoperability is something we're really familiar with everywhere but the web.
It's why plugs work the same everywhere in the country, and why your cell phone works everywhere (except your house of course), why there're eleventy-billion banks, but everyone can take the same four credit cards, and why dads know where the cheapest gas is rather than worrying which company has the right octane. 

This doesn't exist on the web because people have to login with credentials that aren't shareable.
Except with [Sessionless][sessionless], they can. 
And so now you can do something like have all your social media in one app, but _have its content coming from other places_. 

And users won't have to login with any credentials at all.

If that sounds cool then The Nullary is for you.


[allyabase]: https://github.com/planet-nine-app/allyabase
[you-are-not-a-number]: https://github.com/planet-nine-app/the-advancement/blob/main/you-are-not-a-number.md
[sessionless]: https://github.com/planet-nine-app/sessionless
