---
title: GlowAI
summary: Photograph a room and see it redesigned with real furniture you can buy.
kind: app
order: 3
cover: ../../assets/projects/glowai.jpg
facts:
  - label: My role
    value: To confirm
  - label: Team
    value: To confirm
  - label: Year
    value: '2026'
  - label: Duration
    value: To confirm
  - label: Tools
    value: Figma
blocks:
  - type: text
    eyebrow: The problem
    title: Inspiration you can't buy
    body:
      - Redecorating usually starts on Pinterest and ends in a store, guessing. Will that sofa fit? Does it go with the table I already have? And how far over budget is this, really?
      - GlowAI starts from the room you already have. You scan it, tell the AI what you want, and get a new design made only of furniture that exists, inside your budget and ready to buy.
  - type: manifesto
    eyebrow: The idea
    lines:
      - word: Imagine it.
        text: Scan the room and keep the pieces you love.
      - word: Style it.
        text: Describe a mood, add a reference, set a budget.
      - word: Shop it.
        text: Every piece in the render is real, one tap from your door.
  - type: scrolly
    eyebrow: How it works
    title: An old kitchen, a new plan
    lede: Meet Lucas. He wants a brighter kitchen, he's keeping his table, and he has €800.
    steps:
      - title: Map the room
        text: He pans the camera around. The AI measures the space and builds a 3D canvas, no tape measure needed.
        image:
          src: ../../assets/projects/glowai/scan-camera.jpg
          alt: Camera view of a kitchen with scan corners and the hint to pan slowly around the room
      - title: Keep what you love
        text: The scan finds the furniture. Lucas keeps his table, and the new design is built around it.
        note: The table stays. Nobody touches the table.
        image:
          src: ../../assets/projects/glowai/keep-furniture.jpg
          alt: Got furniture you're keeping, with the SKÅLSTA table marked to keep as-is
      - title: Describe the mood
        text: In his own words, or with a tap. Modern and bright.
        image:
          src: ../../assets/projects/glowai/describe.jpg
          alt: Describe what you love, a text field with mood chips like Cozy, Warm, Bold and Minimal
      - title: Add a reference
        text: A photo from his saves shows the look he's after.
        image:
          src: ../../assets/projects/glowai/reference.jpg
          alt: Pick a reference, with upload, From Saves and Discovery
      - title: Set a budget
        text: €800, with three tiers to show what that money buys.
        image:
          src: ../../assets/projects/glowai/budget.jpg
          alt: Let's set a budget, €800 on a slider with Essential, Enhanced and Premium tiers
      - title: Let the AI work
        text: Room, style, furniture, render. A short checklist shows what is happening.
        image:
          src: ../../assets/projects/glowai/generating.jpg
          alt: Building your kitchen design, 18% complete, with room scan and style profile done
  - type: text
    eyebrow: In practice
    title: €45 over budget
    body:
      - The first render came back with a €300 pendant lamp, and the total went over the limit. Instead of starting again, GlowAI offers a lamp with the same look for less.
  - type: swap
    budget: 800
    before:
      src: ../../assets/projects/glowai/render.jpg
      alt: Kitchen render tagged Modern and Bright, with KNOXHULT cabinets, TRETTIOEN lamp and HILLESJÖN sink
    after:
      src: ../../assets/projects/glowai/swapped.jpg
      alt: The same render after the swap, with a confirmation that the pendant lamp now costs €120
    items:
      - name: KNOXHULT Cabinets
        store: Amazon
        price: 349
      - name: TRETTIOEN Lamp
        store: IKEA
        price: 300
        image: ../../assets/projects/glowai/lamp-original.jpg
        swap:
          name: TRETTIOTVÅ Lamp
          price: 120
          image: ../../assets/projects/glowai/lamp-alt.jpg
      - name: HILLESJÖN Sink
        store: IKEA
        price: 196
    caption: One swap, the same look, and the kitchen is back under budget.
  - type: text
    eyebrow: Shop it
    title: From render to doorstep
    body:
      - Every piece links to a real store, and the budget stays in sight until the last click.
  - type: features
    framed: true
    tone: peach
    phone:
      src: ../../assets/projects/glowai/products.jpg
      alt: Products list with the cabinets, lamp and sink, a Buy button for each and the budget bar
    items:
      - icon: bag
        title: Buy from the design
        text: Each piece opens its store, from IKEA to Amazon.
      - icon: wallet
        title: Budget in sight
        text: A bar shows what is spent and what is left.
      - icon: folder
        title: Saved by room
        text: Projects keep every design, so the next room starts faster.
  - type: compare
    eyebrow: Process
    title: From sketch to screen
    lede: Every screen started as a wireframe, with a note on what the AI does at that step. Drag to compare.
    pairs:
      - label: Scan
        wire:
          src: ../../assets/projects/glowai/wf-map.jpg
          alt: Wireframe of the room scan intro
        final:
          src: ../../assets/projects/glowai/map-room.jpg
          alt: Final room scan intro, First, let's map your kitchen
      - label: Keep
        wire:
          src: ../../assets/projects/glowai/wf-keep.jpg
          alt: Wireframe of the keep furniture step
        final:
          src: ../../assets/projects/glowai/keep-furniture.jpg
          alt: Final keep furniture step
      - label: Budget
        wire:
          src: ../../assets/projects/glowai/wf-budget.jpg
          alt: Wireframe of the budget step
        final:
          src: ../../assets/projects/glowai/budget.jpg
          alt: Final budget step
      - label: Result
        wire:
          src: ../../assets/projects/glowai/wf-result.jpg
          alt: Wireframe of the result, with one item over budget
        final:
          src: ../../assets/projects/glowai/render.jpg
          alt: Final result screen
  - type: text
    eyebrow: What I learned
    title: Design for the AI's mistakes
    body:
      - The AI will get things wrong, a piece too expensive or a style a little off. Fixing that has to take one tap, not a fresh start, which is why the swap became the key moment of the flow.
      - Concrete promises build trust. Real products, real prices and a real budget make an AI result feel like something you can act on.
  - type: system
    eyebrow: Look and feel
    title: Visual system
    lede: Warm creams and terracotta make it feel like home, not like tech. Sky blue marks what the AI suggests, and green what is settled.
    colors:
      - name: Glow
        hex: '#e16d3e'
      - name: Terracotta
        hex: '#cd6338'
      - name: Cocoa
        hex: '#5f2e1a'
      - name: Blush
        hex: '#fcf2ee'
      - name: Peach
        hex: '#f6d2c3'
      - name: Sky
        hex: '#3db2e1'
      - name: Leaf
        hex: '#66b856'
    fonts:
      - name: Plus Jakarta Sans Bold
        role: Page titles and sections
        family: Plus Jakarta Sans
        weight: 700
        sample: Pick a room
      - name: SF Compact Rounded
        role: Body, chips and buttons
        family: Nunito
        weight: 600
        sample: Let's set a budget
---

GlowAI is a mobile app where you take a photo of a room and answer a few AI-guided questions about what you want. It generates the space with new furniture that actually exists, and takes you straight to buying it.
