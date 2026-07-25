---
title: "Weaponized Competence"
description: >-
  A fictional short story about a software engineer with ideals, yet still works for Google. 
tags: [Fiction, Tech Culture]
date: 2026-07-25
---
> This is a fictional story. All characters in this story are entirely fictional and any resemblance to actual persons, living or dead, is coincidental, and let's be honest, so unlikely that it almost rises to the level of impossibilty. Prove me wrong, please. I WANT TO BELIEVE.

The nano instance was open in front of her, a git commit message for a merge. Her eyes scanned through the commit messages in her local branch, looking for the snarky comments that nobody should see. The //truth// that nobody should see. She sat back in her chair, rubbing her temples to provide temporary relief of the throbbing that had only gotten more insistent, intense, and painful since "Don't be evil" was intentionally abandoned, a harbinger of things to come.

All those years ago, when she was put on this team, on this project, it was exciting. Technically, sure, it was a camera roll. A chronological view of photos taken from a phone. But then machine learning let her team start figuring out who was in a photo. EXIF data let them start building a heatmap with the users own photos. That bunch of photos from that one vacation, the sunsets from hiking trips on the outskirts of the city people lived in, pictures from events they went to. They were able to consume that data, and create new and interesting ways to display it. In the executive parlance, it was a value-add feature. Value for the user. A nod to them, thanking them for trusting us.

That's not her job anymore though. Same project, but different goals. Instead of giving the user cool tools to do cool things, it shifted to exploiting users, and depending on not only the forced vendor lock-in, but also the technological inertia. Photos was always a thing. How else would I see my pictures? But things got dark. Metrics to determine how long a user looked at a specific kind of picture. That identification functionality turned into ways to push that content to keep people on the app, staring at the screen. Not looking up, not moving on. She remembered holidays with her parents, when they would pull out the shoebox of hardcopies of photos, eliciting a groan and an eyeroll from everyone around. It would never be admitted, but there was always a smile with that groan.


Priya Chandran had the changelist open on her second monitor for eleven minutes before she let herself read it again.

It wasn't complicated, as changes went. Forty-one files, most of them touched by the linter more than by her. The actual logic lived in maybe six of them. A new ranking signal for the Google Photos "Memories" carousel — the one that greeted people every morning with a photo from exactly one year ago, or three, or seven — now weighted toward anything the model flagged as *emotionally significant*. Faces that recurred. Faces that stopped recurring. The system had gotten quite good, this last quarter, at knowing the difference.

She'd flagged it in the design review. Twice, actually, if you counted the Slack thread nobody read past the first two messages. Someone from Growth had walked her through the numbers with the practiced patience of someone repeating a talk they'd already given four times that week — the pilot cohort's daily-open rate up six percent, time-in-app up almost nine, and yes, they'd looked at the sentiment data, and yes, some of it skewed sad, but sad wasn't the same as *bad*, sad was *engagement*, sad was people caring enough to stop scrolling.

Priya had asked, not for the first time, what happened when the "emotionally significant" face belonged to someone who was no longer supposed to be emotionally significant. An ex. A parent, a year out. A friend nobody talked about anymore, for reasons that weren't anybody's business but the person opening the app at 7am with their coffee not yet made.

The room had gone quiet in the specific way rooms go quiet when everyone privately agrees and nobody's job is to say so out loud.

"We can revisit post-launch," the PM had said, which Priya had learned, over nine years of this, to translate as *we will not revisit this*.

So: the changelist. Hers to write, hers to test, hers, in about forty minutes, to merge and let loose on several hundred million phones. Nobody above her had written a line of it. Nobody above her ever would. That was, in its own quiet way, the whole design of the thing — by the time a decision reached someone with the standing to actually refuse it, it had already been rendered as a technical problem with a technical owner, and technical owners ship.

She could quit. She'd thought about it in the shower that morning with the specific, useless clarity that only shows up in showers. She could quit, and someone else — someone with fewer reservations, or the same reservations and a mortgage that made them quieter — would write approximately this same code by Thursday. The feature would ship either way. The only variable she actually controlled was what came bundled with it.

So she controlled that.

She added a setting. Not the setting Growth wanted — buried three menus deep, labeled in the vague, apologetic language reserved for things a product doesn't want you to find — but a real one, surfaced the first time the new carousel ran, worded the way she'd want it worded if it were her own mother reading it at 7am: *Show fewer memories like this.* One tap. No survey asking her to justify the tap. No dark-patterned "are you sure?" standing between a person and the thing they'd just decided they wanted.

She added a second thing too, smaller, the kind of change that wouldn't show up in anyone's slide deck: when the carousel served up a face the model had flagged with its highest emotional-significance score — the ones Growth was proudest of, the ones doing the most work in that nine-percent number — she quietly capped the frequency. Not zero. Zero would get noticed, get "reverted for launch," get her a calendar invite titled something bloodless like *Sync on Memories Performance*. Just... less. Enough that the average would still clear the bar in a dashboard, and never quite clear it in someone's actual, particular, un-averaged morning.

It wasn't defiance. She was careful with herself about that word, lying in bed some nights doing the math on it. Defiance would have been the Slack thread, read past the second message, escalated, fought for, lost anyway, probably, but lost *loudly*. This was smaller than defiance. This was more like triage — the kind of thing you do when you can't stop the bleeding but you can, at least, choose which vein you're not going to touch.

At 4:52 she ran the final test suite. Green. She stared at the merge button the way she imagined surgeons must stare at the first incision — not with doubt about the mechanics, she knew the mechanics cold, but with the specific, private awareness that somewhere out past the edge of what she could see from her desk, this was about to become somebody's Tuesday morning.

She merged it.

Then she opened a new document, and started drafting the design proposal she'd been putting off for two sprints — a real opt-out, right up front, in onboarding, not buried, not gated behind a settings menu nobody scrolled to. Not this quarter's fight. Maybe not next quarter's either. But a person could keep a list of small mercies going, one changelist at a time, and hope that eventually the list added up to something a slide deck couldn't argue with.

She closed her laptop, and went to make the coffee she'd forgotten about an hour ago.
