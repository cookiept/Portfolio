---
title: PetSight
summary: Scan your pet and get an AI health report you can follow over time.
kind: app
order: 2
cover: ../../assets/projects/petsight.jpg
facts:
  - label: My role
    value: Research, wireframes and mockups
  - label: Team
    value: 4 designers
  - label: Year
    value: '2026'
  - label: Duration
    value: 4 weeks
  - label: Tools
    value: Figma
blocks:
  - type: text
    eyebrow: The problem
    title: Pets can't tell you where it hurts
    body:
      - Cats and dogs hide pain by instinct. By the time an owner notices something, the problem has often been building for a while.
      - PetSight makes small, regular check-ups part of the routine, so changes show up early and the vet gets the whole story.
  - type: text
    eyebrow: The idea
    title: A check-up you can film
    body:
      - You start by telling PetSight about your pet, and the check-up adapts to it. Dogs and cats are read differently, following scales vets already use.
      - For dogs, the Glasgow Composite Measure Pain Scale looks at behaviour and movement, like posture, mobility and response to touch. For cats, the Feline Grimace Scale reads five signs in the face, from the ears to the whiskers.
      - The AI turns a short video into scores and an action plan in under two minutes, and every check-up is saved to share with the vet when needed.
  - type: phones
    images:
      - src: ../../assets/projects/petsight/home.jpg
        alt: Home screen greeting Madalena, with Bingo's health score of 85% and energy, mobility and mood rings
        label: Home
      - src: ../../assets/projects/petsight/pet-health.jpg
        alt: Bingo's pet health page with weight, age, illness and previous assessments
        label: Pet health
    caption: Home shows how the pet is doing at a glance, with one health score and three simple rings.
  - type: scrolly
    eyebrow: How it works
    title: From setup to report, in one flow
    lede: A short setup, three filmed phases and a quick review. Every screen has one clear next step.
    steps:
      - chapter: Setup
        title: Tell us about you
        text: A short owner profile, so reports and vet contacts have a name behind them.
        image:
          src: ../../assets/projects/petsight/user-registration.jpg
          alt: User registration form filled in for Madalena Freitas
        mockup: ../../assets/projects/petsight/hand/user-registration.webp
      - title: Then about your pet
        text: Breed, age, sex and weight. Only what the analysis actually needs.
        image:
          src: ../../assets/projects/petsight/pet-registration.jpg
          alt: Pet registration for Bingo, a domestic shorthair, 4 years, 4.2 kg
        mockup: ../../assets/projects/petsight/hand/pet-registration.webp
      - title: Ready for a first check-up
        text: One screen to celebrate, one button to start.
        image:
          src: ../../assets/projects/petsight/all-set.jpg
          alt: Bingo is all set screen inviting a first wellness check-up
        mockup: ../../assets/projects/petsight/hand/all-set.webp
      - chapter: Capture
        title: Film the face
        text: For cats, the face tells a lot. Three tips on screen keep the shot useful.
        note: Three phases, a few seconds each. Bingo was very patient.
        image:
          src: ../../assets/projects/petsight/phase-face.jpg
          alt: Camera view for phase 1, framing Bingo's face, with three tips
        mockup: ../../assets/projects/petsight/hand/phase-face.webp
      - title: Then the walk
        text: A few steps across the room show how the pet moves and carries its weight.
        image:
          src: ../../assets/projects/petsight/phase-walk.jpg
          alt: Camera view for phase 2, walking gait, framing the cat
        mockup: ../../assets/projects/petsight/hand/phase-walk.webp
      - title: And how it moves
        text: A jump or a stretch, filmed from the side, shows the range of motion.
        image:
          src: ../../assets/projects/petsight/phase-motion.jpg
          alt: Camera view for phase 3, active motion, filming the cat from the side
        mockup: ../../assets/projects/petsight/hand/phase-motion.webp
      - chapter: Review
        title: Check every clip
        text: A quick quality checklist, so a shaky video gets retaken before it reaches the AI.
        image:
          src: ../../assets/projects/petsight/review-walk.jpg
          alt: Review of the walking capture with a quality checklist
        mockup: ../../assets/projects/petsight/hand/review-walk.webp
      - title: Get the report
        text: In under two minutes, a health assistant opens with the report and an action plan.
        image:
          src: ../../assets/projects/petsight/assistant.jpg
          alt: Health assistant chat opening with Bingo's report and action plan
        mockup: ../../assets/projects/petsight/hand/assistant.webp
  - type: text
    eyebrow: The result
    title: A report you can act on
    body:
      - Three scores, each with a plain explanation, then an action plan sorted by priority. The report can be shared or saved as a PDF for the vet.
      - A health assistant opens with the report, so owners can ask what a score means or what to do next.
  - type: report
    phone:
      src: ../../assets/projects/petsight/summary.jpg
      alt: Health summary with facial symmetry 92%, gait regularity 74% and range of motion 81%
    scores:
      - label: Facial symmetry
        value: 92
        tone: good
        text: No visible asymmetry. Jaw and eye spacing within normal range.
      - label: Gait regularity
        value: 74
        tone: warn
        text: Minor irregularity in the left hind leg stride.
      - label: Range of motion
        value: 81
        tone: good
        text: Flexion and extension within normal bounds.
    actions:
      - priority: Medium priority
        text: Record a new 30-second mobility video tomorrow morning.
      - priority: Medium priority
        text: Avoid jumping and high-impact running for the next 24 hours.
    caption: Each score comes with a plain explanation, and the action plan turns it into next steps.
    note: 74% gait? Probably just a lazy Sunday.
  - type: text
    eyebrow: Use case
    title: When something looks wrong
    body:
      - Not every check-up is routine. In this scenario, the owner spots a red swelling on his cat's paw.
      - PetSight asks where it is and how much it seems to bother the cat, then switches from video to photos of the paw. The same report adapts to the worry.
  - type: story
    steps:
      - title: Notice
        text: The owner describes the worry in his own words.
        chips: [Limping, Lethargy, Scratching, Other]
        quote: I need to figure out what this red swelling on my cat's paw is.
      - title: Point
        text: A body map narrows it down to the back leg.
        image:
          src: ../../assets/projects/petsight/story-area.jpg
          alt: Cat body map with the back leg selected
      - title: Rate
        text: How much does it seem to bother the cat, from 1 to 5.
        scale: { value: 2, max: 5, low: Very mild, high: Severe / Urgent }
      - title: Photograph
        text: Two photos of the paw, top and bottom, instead of a video.
        image:
          src: ../../assets/projects/petsight/story-photo.jpg
          alt: Camera framing the bottom of the cat's paw inside a circle guide
    result:
      title: A report that fits the worry
      text: Redness, swelling and skin integrity get their own scores, with care steps like washing the paw and a cold compress.
      image:
        src: ../../assets/projects/petsight/paw-report.jpg
        alt: Health summary with erythema intensity, edema estimation and surface integrity
      mockup: ../../assets/projects/petsight/hand/phone-paw-report.webp
  - type: text
    eyebrow: Beyond one scan
    title: Health that adds up over time
    body:
      - Every check-up joins the pet's history. Owners can search past reports by date, keep upcoming events like vaccines in one place, and link the profile to their vet and family.
  - type: phones
    images:
      - src: ../../assets/projects/petsight/calendar.jpg
        alt: Health assessments calendar to search reports by date range
        label: Search by date
    note: Every check-up is saved, so the vet sees the whole story.
  - type: text
    eyebrow: What I learned
    title: Research kept us honest
    body:
      - I learned a lot about animal behaviour, and about how differently cats and dogs show pain.
      - The research phase pushed us toward checks that are actually possible with the tools and evidence we had. Reading a dog's face, for example, made no sense, so each species gets the kind of check vets already trust for it.
  - type: system
    eyebrow: Look and feel
    title: Visual system
    lede: Soft blues and rounded type keep a health app calm. Green and honey only appear where a score needs attention.
    colors:
      - name: Deep navy
        hex: '#1a3f55'
      - name: Ocean
        hex: '#2e7eb3'
      - name: Sky
        hex: '#56a2d8'
      - name: Mist
        hex: '#aad2ec'
      - name: Cloud
        hex: '#f7fcff'
      - name: Sage
        hex: '#98c788'
      - name: Honey
        hex: '#e4ac51'
    fonts:
      - name: Quicksand Bold
        role: Titles and pet names
        family: Quicksand
        weight: 700
        sample: Bingo is all set!
      - name: Nunito
        role: Body, labels and buttons
        family: Nunito
        weight: 400
        sample: Start first evaluation
---

PetSight helps owners keep an eye on their pet's health. A short check-up, filmed with the phone and read by AI, turns into a report with scores and an action plan that builds up over time.

The check-up adapts to the animal. Dogs are read through behaviour and movement, cats through the face as well, following the pain scales vets already use.
