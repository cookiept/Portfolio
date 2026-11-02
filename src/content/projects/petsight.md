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
      - Cats and dogs hide pain by instinct, so problems often show up late.
      - PetSight makes a quick filmed check-up part of the routine. The AI reads each species the way vets already do, and turns a short video into scores and an action plan.
  - type: scrolly
    eyebrow: How it works
    title: From setup to report, in one flow
    lede: Set up once, film three short clips, get a report.
    steps:
      - title: Set up in a minute
        text: You and your pet, with only what the analysis needs.
        image:
          src: ../../assets/projects/petsight/pet-registration.jpg
          alt: Pet registration for Bingo, a domestic shorthair, 4 years, 4.2 kg
        mockup: ../../assets/projects/petsight/hand/pet-registration.webp
      - title: Film the face
        text: For cats, the face tells a lot. Tips on screen keep the shot useful.
        note: Three phases, a few seconds each. Bingo was very patient.
        image:
          src: ../../assets/projects/petsight/phase-face.jpg
          alt: Camera view for phase 1, framing Bingo's face, with three tips
        mockup: ../../assets/projects/petsight/hand/phase-face.webp
      - title: Then the walk
        text: A few steps across the room show how the pet carries its weight.
        image:
          src: ../../assets/projects/petsight/phase-walk.jpg
          alt: Camera view for phase 2, walking gait, framing the cat
        mockup: ../../assets/projects/petsight/hand/phase-walk.webp
      - title: And how it moves
        text: A jump or a stretch shows the range of motion.
        image:
          src: ../../assets/projects/petsight/phase-motion.jpg
          alt: Camera view for phase 3, active motion, filming the cat from the side
        mockup: ../../assets/projects/petsight/hand/phase-motion.webp
      - title: Get the report
        text: In under two minutes, with an assistant to answer questions.
        image:
          src: ../../assets/projects/petsight/assistant.jpg
          alt: Health assistant chat opening with Bingo's report and action plan
        mockup: ../../assets/projects/petsight/hand/assistant.webp
  - type: text
    eyebrow: In practice
    title: A swollen paw, step by step
    body:
      - Bingo's owner spots a red swelling on his paw. PetSight starts from that worry, with a few quick questions and two photos.
  - type: story
    steps:
      - title: Notice
        text: The owner describes the worry in their own words.
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
    bridge: Two minutes later
  - type: text
    eyebrow: Beyond one scan
    title: Health that adds up over time
    body:
      - Every check-up joins the pet's history.
  - type: features
    phone:
      src: ../../assets/projects/petsight/hand/phone-calendar.webp
      alt: Health assessments calendar to search reports by date range
    items:
      - icon: calendar
        title: Search by date
        text: Pick a range on the calendar and get one report for that period.
      - icon: syringe
        title: Vaccines and events
        text: Upcoming vaccines and vet visits live next to the check-ups.
      - icon: share
        title: Shared with the vet
        text: Link the profile to the vet and family, so everyone sees the same history.
    note: Every check-up is saved, so the vet sees the whole story.
  - type: text
    eyebrow: What I learned
    title: Research kept us honest
    body:
      - I learned a lot about animal behaviour, and how differently cats and dogs show pain.
      - Research kept the solution possible. Reading a dog's face made no sense, so dogs follow the Glasgow pain scale, based on posture and movement, and cats the Feline Grimace Scale, which reads five signs in the face.
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

PetSight turns a short video of your pet into a health report you can follow over time. The check-up adapts to the animal and follows the pain scales vets already use.
