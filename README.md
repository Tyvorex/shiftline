# SHIFTLINE

A free, static 3D open-city driving prototype. Explore a coastal grid city, drive 20 distinct vehicle models and switch between traffic cars in slow time.

## Play

Use the GitHub Pages link in this repository's deployment settings. A modern desktop browser with WebGL and hardware acceleration is recommended. The first load downloads models from jsDelivr, with a raw GitHub fallback. An internet connection is required. There is no paid API or backend.

## Controls

- WASD or arrow keys: accelerate, brake/reverse and steer
- Space: handbrake
- Shift: slow-time car switching view
- Click another car, or Tab to choose and E to enter
- C: cycle three camera views
- R: recover to a nearby road
- M: full map. Click it to set a waypoint
- Escape: pause menu

The starting-ride selector offers all 20 models. Mobile has basic steering and pedal buttons, but desktop is the primary target.

## Included

- 20 distinct Kenney vehicle models, with separate handling values
- 40 traffic vehicles, simple lane loops and obstacle slowing
- Asset-based city buildings, downtown towers, parks and coastal roads
- Sun shadows, warm gradient sky and textured roads
- Speed-sensitive bicycle steering, acceleration, braking, reverse and lateral grip
- Low-speed rigid-body-style car collision impulses using oriented rectangles and vehicle mass
- Approximate building collisions using a two-circle vehicle hull and building bounds
- HUD, minimap, full map, waypoint markers, free-roam beacon runs and pause menu
- Engine tone, impact sounds, mute, wheel animation and three camera views

## Scope and limits

This is an arcade prototype, not a recreation of Driver: San Francisco or a vehicle simulator. The city is a finite, flat grid about 750 metres wide. Buildings cannot be entered. There are no pedestrians, missions with a story, multiplayer, suspension simulation, damage deformation or realistic tyre/surface modelling. Traffic uses simple loops and can get stuck after collisions. The map's waypoint line is a direction guide, not road-routing navigation. Model loading and WebGL performance depend on the browser, GPU and free CDN availability.

## Assets and licenses

Cars and buildings use Kenney assets licensed Creative Commons CC0:

- Car Kit: https://kenney.nl/assets/car-kit
- City Kit (Commercial): https://kenney.nl/assets/city-kit-commercial
- GLB distribution mirror: https://github.com/shorepine/kenney

The car set includes passenger cars, sports cars, pickups, vans, emergency/service vehicles and tractors. Designs are fictional, not licensed real-world car brands.

three.js is used under the MIT License: https://github.com/mrdoob/three.js/blob/dev/LICENSE

Fonts: Inter and Barlow Condensed, served through Google Fonts under their open font licenses. Road markings, terrain, sky, trees, interface and gameplay code are generated for this project.

## Verification

Tested loading all 20 models, menu/start, acceleration and braking, car collision separation and momentum exchange, keyboard car switching, recovery, and map view. No JavaScript exceptions were reported in the tested desktop runs. This does not guarantee every browser or every driving situation is bug-free.

## Steering and color update

- Each tyre now has separate steering and rolling pivots, centered on the tyre. Steering no longer causes the spinning axle to tilt. The SUV spare tyre stays fixed.
- Inner and outer front tyres use slightly different steering angles. Wheel rotation uses each tyre radius, including the tractors' larger rear tyres.
- Handbrake turns preserve sideways momentum instead of snapping velocity to the new heading.
- Cinematic color treatment is on by default. The menu's Look button switches to Natural. The interface itself is not color-filtered.

The update was checked on every one of the 20 vehicle types: selection, acceleration, left/right turns, brake/reverse, handbrake, full wheel revolutions, stable wheel centers, building collisions and car-to-car mass/impulse response. Menu, camera cycling, keyboard and mouse possession, map/waypoint, recovery, beacon scoring, mute/grade toggles, blur-to-pause, AI movement and basic mobile gas input were also checked in desktop Chrome / emulated touch Chrome. No JavaScript exceptions were reported in these checks. That is a bounded test pass, not a claim that every situation or browser is bug-free.
