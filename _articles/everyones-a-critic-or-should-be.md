---
title: "Everyone's a Critic, or Should Be"
description: >-
  Code review used to be about catching tired-human mistakes. Now a lot of what shows up in a pull request was never tired, or human — and that changes what review actually has to do.
tags: [Software Engineering, Code Review, AI]
date: 2026-07-25
---
There's an old joke about critics: everyone's got one, they've never made anything themselves, and they're always standing just outside the thing they're judging. It's a cheap shot, and it's also backwards. The people who make the best critics are usually the ones who've built things and gotten it wrong enough times to know what wrong looks like.

I bring this up because "code review" has quietly become one of the most undervalued jobs in software, right at the moment it matters more than it ever has.

For a long time, review was mostly about catching human mistakes — a missed edge case, an off-by-one, a variable name that lied about what it held. Slow, occasionally tedious, but predictable. You knew roughly what kind of bugs to expect, because you knew roughly how a tired human writes code at 4pm on a Friday.

That's not quite the job anymore.

A lot of the code hitting pull requests today didn't originate from a tired human at 4pm. It came out of a model that's very good at sounding confident and very good at pattern-matching its way to something that compiles, passes the obvious tests, and reads like it was written by someone who knew what they were doing — because, in a sense, it was. It's been trained on an enormous pile of code written by people who knew what they were doing. The problem is it's also been trained on an enormous pile of code written by people who very much did not, and it doesn't reliably know which pile any given pattern came from.

That's the trap. LLM-generated code doesn't fail the way careless-human code fails. Careless-human code tends to look careless — inconsistent naming, missing error handling, a comment that says `// TODO: fix this` and never gets fixed. It's easy to spot, because sloppiness has a smell. Model-generated code usually doesn't have that smell. It's clean. It's confident. It uses the right vocabulary. And it can still be wrong in ways that are genuinely hard to catch on a skim — a subtly wrong assumption about how a library behaves, an authorization check that looks present but checks the wrong thing, a retry loop that will absolutely take your service down under the exact conditions it was supposed to protect against.

Which is exactly why the "speed bump" of a real review matters more now, not less. Not a rubber stamp, not an "LGTM" typed while already thinking about lunch — an actual read. Does this do what it claims to do? Why this approach, and not the other three that are also plausible? What happens when this input is empty, or huge, or malicious? A model can write plausible answers to all of those questions. It can't be held responsible for them. Someone still has to be the person who understood the change well enough to explain it to somebody else — and that job doesn't go away just because the first draft got faster to produce.

There's a selfish argument buried in here too, and it's worth saying out loud: reviewing carefully is how you stay good at this. If you're the one accepting changes without really reading them, you're not saving time, you're just moving the cost downstream — to the on-call engineer at 2am, to the teammate six months from now trying to figure out why this function does something nobody can explain, to yourself in a year when you've forgotten you ever approved it. Review is also apprenticeship, in both directions; the reviewer learns the codebase better by reading closely, and the person being reviewed gets better by being asked good questions.

None of this is an argument against using these tools — I use them plenty, and they're often genuinely good. It's an argument against treating the pull request as a formality now that the code looks tidier going in. If anything, tidy code from a source that can't be cross-examined is exactly the kind of code that deserves the most scrutiny, not the least. Everyone's a critic. In this line of work, we'd all be better off if more of us actually acted like one.
