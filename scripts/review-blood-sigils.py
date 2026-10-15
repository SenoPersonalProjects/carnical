"""Reviewed Blood Sigils magic, including entries missing from the old index."""
import json,re,sys
from pathlib import Path
work=Path(sys.argv[1]);repo=Path(__file__).resolve().parent.parent;book='sigilos-de-sangue-v5'
source=next(x for x in json.loads((work/'pages/manifest.json').read_text(encoding='utf-8')) if x['id']==book)
candidates=json.loads((work/'catalog/candidates.json').read_text(encoding='utf-8'))
# Native heading, stable legacy name, English name, level, pages, English rules.
rituals=[
('Astromancia','Astromancia','Astromancy',1,[61,62],'''Description: Reads the subject through astrology and blood divination: the stars write, or reflect, the nature of those below.
Ingredients: Night sky; silver mirror or tray; the subject's blood, hair, saliva or flesh.
Process: At midnight, find an unobstructed view of the stars, place the subject's biological material on the silver surface and spread one Rouse Check's worth of Blood over it. Watch its patterns for up to half an hour.
System: A win reveals the subject's greatest aptitudes (Attributes or Skills at 4 or more) and current Ambition. A critical also reveals their current Desire and at least one Conviction. Knowing either their correct birth date or Embrace date adds one die to the Ritual pool; knowing both still adds only one.'''),
('Amarre a língua acusadora','Amarre a Língua Acusadora','Bind the Accusing Tongue',1,[62,64],'''Description: Developed during the Tremere rise to power, this prevents the subject from speaking ill of the caster and keeping their unspeakable deeds unspoken.
Ingredients: A photograph, effigy or image of the subject, a lock of their hair and black silk cord.
Process: Wind the cord around the hair and image while chanting.
System: A win prevents the target from directly saying, writing or communicating anything negative or harmful about the caster, even if true, unless they pass Composure + Resolve at Difficulty Blood Sorcery + 2, or Blood Sorcery + 3 on a critical Ritual win. The effect ends when the target succeeds or the cord is unwound; the hair and image then crumble into dust.'''),
('Mestre Artesão','Mestre Artesão','Master Craftsman',2,[64],'''Description: Drinks the ability of a talented individual instead of slowly mastering a craft through practice.
Ingredients: Blood from a talented subject, an appropriate craft object such as a needle, written page, playing card or chisel, and vulture bones.
Process: Char the bones in a fire, place the object in a bowl above the flames, cover it with the subject's blood, and drink when the last bones crack and burn, letting the object touch the lips.
System: A win grants the subject's dots and Specialty in the relevant Academics, Craft, Performance or Science Skill until sunrise. The dots replace, rather than add to, the caster's own. If they already have that Specialty, they gain another die beyond its normal bonus. A critical extends the effect to a week. On a total failure they swallow the object and suffer two Aggravated Health damage as it travels through their body, spiritually angered by the theft.'''),
('Profundezas do Pesadelo','Profundezas do Pesadelo','Depths of Nightmare',2,[64],'''Description: A Setite punishment depicting nightmares of Duat, now widespread for its ability to undermine a victim's will.
Ingredients: The target's hair, melted wax and natron (sodium carbonate).
Process: Mix one Rouse Check of Blood into the wax and wrap the hair in it. Shape a figure resembling the victim, inscribe glyphs or curses in the caster's native language, and immerse it in water mixed with natron.
System: A win causes nightmares for a number of days (or nights for mortals) equal to the successes rolled. Each awakening inflicts one Superficial Willpower damage, Aggravated on a critical win. This damage cannot heal normally until the spell ends; magic or similar means can remove it. On a total failure the target has pleasant dreams and sees an ibis-headed man directing them toward the caster, even if no Kemetic imagery was used.'''),
('Apreensão Elemental','Apreensão Elemental','Elemental Grasp',2,[64,65],'''Description: A koldunic ritual commands the chosen element to impede a perceived target with mud, rocks, floods, hail, wind, fog, heat or fire. Magical perception qualifies.
Requirements: Koldunic Sorcery, with the appropriate element.
Ingredients: A handful of the element or a ritual representation, such as a wooden staff for earth, or a knife or bundle of feathers for air.
Process: Open the initiation scar and make a Rouse Check while commanding the element.
System: A win inflicts one Superficial Health damage per success and forces an appropriate Skill test to proceed against the element, Difficulty 1 + total Ritual successes. An already active element, such as air in a storm, adds one die to the Ritual pool. A critical affects all appropriate targets within sight of the main target. The effect ends when the koldun does anything besides command the element, including moving, fighting or another Skill test.
Source terminology: The supplied translated PDF uses the ambiguous example “Compostura + Impulso”; the appropriate trait for that example requires the Storyteller's clarification rather than silently treating it as Blood Surge.'''),
('Le Sang de l\'Amour','Le Sang De L’amour','Le Sang de l’Amour',2,[65,66],'''Description: Creates a connection between lovers beyond mutual attraction.
Ingredients: Blood from caster and lover and two glass vials on chains or leather straps.
Process: Simultaneously collect a teaspoon of blood from each, keeping it separate. Both must desire each other during casting. Seal each sample, exchange vials and wear them around the neck while praising the lover to Aphrodite, Ishtar or another deity of love or lust.
System: A win allows each participant to concentrate with Resolve + Awareness to sense the other's approximate distance and location: same city, state, across an ocean. Further successes yield sensory details such as a moving deck, difficult climbing or loud vibrations. A critical grants one automatic success on the lover-perception test; further successes can give glimpses of surroundings and fragments of conversation. On total failure, the samples mix and attempts to concentrate cause confusion and reduce Composure by one through the end of the next scene, even if both vials are broken. If either lover was unwilling during casting (tell the Storyteller privately), the blood dries and clots on first use without magical harm beyond personal consequences.
Duration: While both wear the other's intact vial.'''),
('Silentia Mortis','Silentia Mortis','Silentia Mortis',2,[66],'''Description: Originally a Banu Haqim substitute for Silence of Death, the talisman creates magical silence by stirring its bearer's Blood. Outside sounds can still be heard faintly inside.
Ingredients: A cat's paw or another silent desert predator's, the caster's Blood (and bearer's if different), a corpse-wax candle and a white rose.
Process: Whisper the ritual, cut the palm and soak the paw with one Rouse Check of Blood. A different bearer must also cut their palm, make their own Rouse Check and mix Blood while remaining silent. Burn the rose and extinguish the candle with the bloody paw.
System: A win creates a six-meter radius of silence when the bearer activates the talisman with a second Rouse Check; a critical increases the radius to twelve meters. It must touch flesh but need not be held.
Duration: One hour or until the bearer loses the talisman; it then disintegrates.'''),
('Tiamat brilha','Tiamat Glistens','Tiamat Glistens',2,[66,67],'''Description: Tunes a place of power to the caster and unlocks its potential. It is common in chained rituals; no publicly known method makes the attunement permanent.
Ingredients: A place of power such as a furcus and powdered precious metal appropriate to its magical valence.
Process: Mix one Rouse Check of Blood with the metal and scatter it into the air and ground while praising Tiamat for at least fifteen minutes.
System: For nights equal to the Ritual successes, the caster's rituals there gain the site's associated bonuses or advantages, usually Ritual dice (Furcus, printed p. 35). A critical also makes one die of their Ritual roll automatically succeed. Only one caster can benefit at a place at once: a later successful casting immediately replaces the earlier caster's bonus.'''),
('Jardim das Vísceras','Jardim das Vísceras','Visceral Garden',2,[67],'''Description: Grows Blood-addicted plants for magic or amusement while disposing of a body.
Ingredients: A plot of soil, a day-old human or animal corpse, and the caster's Blood for upkeep.
Process: Clear and dig the plot. Pour one Rouse Check of Blood into the corpse, eviscerate it into the hole and plant over the viscera. A human corpse must be a day old to avoid an accidental Embrace.
System: A win dissolves buried remains into blood-scented smoke and makes exceptionally hardy plants that vampires can eat without vomiting, although they sate no Hunger. Against a mortal who ate one, vampiric influence Discipline tests have Difficulty reduced by one, or the mortal loses two resistance dice in contests. Feed the plants one Rouse Check of Blood monthly or they wither and die within a week; a critical extends watering to every two months. An animal corpse fertilizes about one square meter (three by three feet); a human corpse doubles those dimensions.'''),
('Sigilo de Sangue','Sigilo de Sangue','Blood Sigil',3,[68],'''Description: Stores documents and records in another Kindred's dead flesh.
Ingredients: Tattoo ink or another skin-staining substance, a written message, photograph or painting, and a sharp object heated in a candle flame.
Process: The vampire receiving the tattoo bleeds from the wrist into the pigment. The caster tears the document or image into it, chants for fifteen minutes, then heats and dips the sharp point and carefully carves a tattoo. Its outward design need not reveal the hidden information.
System: Roll only when applying the sigil. A win makes the tattoo permanent and perfectly preserves the message; failure produces a tattoo and message that disappear on the vampire's next rising. Reading it requires fifteen minutes observing or touching it and Resolve + Occult, Difficulty 5 (4 by touch), or Sense the Unseen. The caster can erase tattoo and message by spending one Willpower and touching it for fifteen minutes.'''),
('Abrigo Elemental','Abrigo Elemental','Elemental Shelter',3,[68],'''Description: A koldun merges with their chosen element, like Earth Meld. Fire kolduny need not test terror frenzy for a fire deliberately lit for this ritual, but must resist it to enter an unexpectedly burning haven.
Requirements: Koldunic Sorcery, with the appropriate element.
Ingredients: Enough of the element to enclose the body.
Process: Bleed from the initiation scar into the element, command it to receive the caster, and fall or dive in.
System: A win protects against physical attacks, sunlight and fire. The caster perceives surroundings except during daysleep, when disturbances follow normal awakening rules (Core p. 219). Their wavering shape is visible to Sense the Unseen or Wits + Awareness at Difficulty equal to the Ritual margin; a critical makes them wholly invisible. At night they may emerge where they entered. If the sheltering fire goes out, or the water is drained, the koldun enters torpor in or below the remains and can test Resolve + Awareness, Difficulty 2, to wake for potential prey as with hunger torpor.'''),
('Nepenthe','Nepenthe','Nepenthe',3,[68,69],'''Description: A sweet potion makes terrible acts feel remote, briefly numbing grief and conflict. Repeated use destroys the capacity for remorse.
Ingredients: Poppy seeds, starflower, honey, the subject's tears and caster's Blood.
Process: Grind the solids, mix Blood and honey, add the tears last and drink the intensely sweet-smelling potion in one draught.
System: A win removes one Stain before Remorse; a critical removes two before the session-ending Remorse roll. On a total failure one Stain carries to the next session regardless of Remorse success. Using it for more than two consecutive sessions causes dependence and makes one Stain permanent. This is cumulative: four successive sessions produce two permanent Stains, and so on.'''),
('Ver com os olhos do céu','Ver com os Olhos do Céu','See with the Eyes of Heaven',3,[69],'''Description: Banu Haqim observe a target from the unseen heavens; skeptical Tremere have adopted the ritual despite disputing that explanation.
Ingredients: Euphoric mortal blood, often cannabis-influenced, incense, a brazier and an effigy or image of the target.
Process: Drink the euphoric blood, burn incense with one Rouse Check of the caster's Blood, inhale and enter an ecstatic trance while studying the target image.
System: After half an hour roll the Ritual. On a win, ask the Storyteller one question about the target's location and surroundings per success. A critical adds three questions and allows questions about Ambition, Desire, Convictions and Humanity as well as location.'''),
('Procurando Tiamat','Procurando Tiamat','Seeking Tiamat',3,[70],'''Description: Tunes the caster's Blood to Tiamat's to find earth's veins.
Ingredients: A sharpened thirty-centimeter piece of witch hazel or magnetized iron.
Process: Insert it along the forearm's ulnar vein, taking one Aggravated damage and making a Rouse Check, then walk the city or region for at least fifteen minutes.
System: A win makes the arm twitch toward the nearest furcus; changing direction can triangulate it in minutes. A critical finds the nearest earth's vein and points toward two furci on it.'''),
('Alma do Hemonculus','Alma do Hemonculus','Soul of the Homunculus',3,[70],'''Description: Creates a shriveled, quarter-weight copy of the caster's mortal self. The small, limited and often bitter creature obeys its maker and is unharmed by sunlight, serving as assistant, retainer or substitute child.
Ingredients: A glass bottle blown on the night before the new moon, semen, chalk, graveyard earth, caster's Blood, a dead man's thumb and a dead pig.
Process: Bottle the ingredients, stopper with the thumb, shake and keep in complete darkness until the full moon. Bathe the bottle in moonlight while chanting, sew it into the pig and bury it at least a meter deep in consecrated soil. Roll then; if successful, at the next new moon the pig dug up resembles a miniature caster and must rise at their command.
System: Difficulty is the greater of 3 or the user's Stamina, as their own flesh resists the blasphemy. Successful creation takes a month. The homunculus has the maker's Attributes and mortal-life Skills minus one each, minimum 1; half the maker's Health and one Willpower. It cannot become a ghoul, be Embraced or Blood Bound; feeding on it gives no nourishment and is repellent.'''),
('Pedra da Verdadeira Forma','Pedra da Verdadeira Forma','Stone of the True Form',3,[70],'''Description: A specially prepared throwing stone dispels illusions and transformations, and is rumored to work on werewolves.
Ingredients: Metamorphic rock such as slate or marble.
Process: Smooth or carve a sphere between marble and baseball size. A relevant Craft Specialty or geology laboratory allows a test to finish in an hour; otherwise six hours. Coat it in one Rouse Check of boiling Blood and command it to reveal truth in the oldest language known.
System: Throw with Dexterity + Athletics. If it hits an illusion, a being created by Discipline or ritual (such as a vozhd or homunculus), or a transformed creature, roll the Ritual against Resolve + Occult. A win disperses the illusion in blood, separates the creation into components, or painfully restores the shapeshifter's original form for one turn. The margin becomes a dice penalty to restoring the illusion, creation or next transformation. On failure, recover the stone and retry until sunrise if possible. A successful stone splits and cannot be reused.'''),
('Invasão','Invasão','Trespass',3,[71],'''Description: An old Ministry ritual conceals the intruder as part of a specified building, such as a pillar, statue, molding or tapestry. Supernatural observers can still perceive them, and it does not hide them from a genius loci. Unlike Incorporeal Passage, the user can be attacked and damaged.
Ingredients: A fragment of the destination's cornerstone or threshold, a thief's blood and thread.
Process: Tie the fragment, soak it and the thread in blood, invoke Hermes, Set or another patron of intrusion, then wind the thread from the caster's heel to forehead.
System: Roll on actually entering the building. A win grants entry and, by spending Willpower, passage through cracks where liquid blood could flow, such as door gaps or vents, but not a sealed vault. A critical removes that Willpower cost and provides an intuitive layout. A total failure makes the building reject the intruder: observers gain two dice to notice and suspect them, and each turn inside they suffer Superficial Health damage equal to the failed dice in that Ritual pool.
Duration: While the thread stays wet with blood, one scene or about thirty minutes.'''),
('Haruspex viral','Haruspex Viral','Viral Haruspex',3,[71],'''Description: Exclusive to plague oracles, gathers perceptions or factual memories from rhinovirus-infected mortals within twenty kilometers. It can discover whether someone with a cold saw a person or remembers a fact, without relying on outside records.
Requirements: Host living rhinovirus by feeding from a mortal carrier within the previous twenty-four hours; germs die in Kindred Blood afterward.
Ingredients: Living rhinovirus in the caster's Blood, a rat and a bowl or dish; surgical steel is favored but not required.
Process: Mix one Rouse Check of Blood with the rat's brain, stir counterclockwise and drink while gazing at the dish.
System: A win grants a vague impression of the desired information, overlapping if several infected mortals observe the same subject. Factual knowledge flows directly into the caster's mind. More successes beyond Difficulty give clearer vision, knowledge or other results.'''),
('Compelir o Inanimado','Compelir o Inanimado','Compel the Inanimate',4,[71,72],'''Description: Briefly commands an object, with enough delay for the caster to leave and claim plausible deniability.
Ingredients: Any inanimate object.
Process: Smear a glyph with one Rouse Check of Blood and give a quick command. When the Blood dries, around five minutes later, the object obeys as best it can.
System: A win lets the object understand the intended command; a critical adds a second, which may occur at another time but before night's end. Commands must be simple: fall, break or erase your databases, not complex sentences. Objects cannot recognize particular people or time precisely. The caster must remain in the same relative environment (the park for a park lamp, the museum for its armor) when the command is performed. Sense the Unseen can locate the caster with Wits + Auspex against their Composure + Blood Sorcery.'''),
('Consulta de Egrégora','Consulta de Egrégora','Egregore Consultation',4,[72],'''Description: A plague-oracle ritual draws on the combined knowledge and instincts of people with influenza within twenty kilometers, supplementing the caster's training with relevant local experience.
Requirements: Host influenza; plague-oracle rituals require feeding from a mortal carrier within twenty-four hours.
Ingredients: Live influenza virus in the caster's Blood, worms or other parasites, a knife and a magnet.
Process: Cut the worms, spread them on the magnet, hold it in the left hand, face north and chant.
System: Choose a Skill before rolling. On a win, the next three tests using it gain dice equal to one plus Ritual margin. Add another die if the Storyteller considers the Skill only slightly uncommon locally, or two if very common. A critical adds a free Specialty, or another bonus die if the desired Specialty is already known. For example, local scholars, financiers or gun users may supply relevant experience.'''),
('Sustento da Terra','Sustento da Terra','Sustenance of the Earth',4,[72,73],'''Description: Feeds mystically from a place of power by turning it into a place of suffering. Kolduny call their version Mouth of the Earth.
Ingredients: A place of power such as a furcus, a dagger and a boundary marker such as police tape, a sign or an enclosure.
Process: Over four nights carve occult signs at the corners, one per night. On the fifth, use half a Rouse Check of Blood to mark every sign before night ends and the other half to mark and place the boundary object.
System: A win makes wounds and accidents there bloodier and more dangerous, transferring the land's feeding to the caster. Once per session they may automatically pass a number of Rouse Checks equal to Ritual margin.
Duration: Until story's end; renew by coating the signs with another Rouse Check and making a Ritual roll.'''),
('Cavalgando nas veias da Terra','Cavalgando nas Veias da Terra','Riding the Earth’s Veins',4,[73],'''Description: An old Banu Haqim escape ritual uses a furcus to ride the planet's secret paths, but the destination is beyond the caster's control.
Ingredients: A furcus and a physical entrance token such as a ticket, key or doorknob.
Process: At that furcus, bathe the token in one Rouse Check of Blood, invoke a patron of escape, travel or wind (traditionally Enlil), and pour the Blood onto the ground after ten minutes.
System: Roll only when touching the chosen furcus's ground or floor with the token. A win dissolves the caster into bloody mist and restores them twenty minutes later at a furcus chosen by the Storyteller. A critical instead reaches the furcus nearest their Haven or a place attuned through Tiamat Glistens. This is one-way and only activates at the specific furcus where prepared.'''),
('Ataque Elemental','Ataque Elemental','Elemental Attack',5,[73,74],'''Description: Commands an element to attack with landslides, falling trees, floods, waterspouts, lightning, suffocation, gas explosions or fire.
Requirements: Koldunic Sorcery, with the appropriate element.
Ingredients: A weapon made of or representing the element, such as a wooden club, icicle, meteoric iron knife or torch.
Process: Open the initiation scar with the weapon and make a Rouse Check while commanding the element against a perceived target; magical perception qualifies.
System: A win inflicts one Aggravated Health damage per success, repeated each following turn until the victim wins an appropriate escape contest (such as Dexterity + Athletics) against the koldun's Resolve + Blood Sorcery. Other than fire, elements cause only Superficial damage to vampires, but may still bury or carry them away. An already active element adds one Ritual die. A critical affects appropriate targets chosen by the caster within sight of the main victim. Doing anything else, including moving, fighting or another Skill test, ends the effect.
Chain: With Elemental Grasp and Tiamat Glistens, creates near-apocalyptic earthquakes, tsunamis, tornadoes or magma flows. Target damage doubles, but collateral damage is uncontrolled until the kolduny stop casting.'''),
('Rei Pescador','Rei Pescador','Fisher King',5,[74,75],'''Description: Mentally joins caster and land, roughly the coterie's domain in size depending on power. Kolduny call it Lozov Kral.
Ingredients: A regional landmark, earth from the region and a horsehair brush.
Process: Mix one Rouse Check of Blood with the earth and paint magical signs on a landmark important to its inhabitants.
System: A win grants a mental connection. Once per session, roll Wits + Streetwise in urban or suburban land, or Wits + Survival in rural land. Each success earns a truthful answer about its greatest threat, resident enemies, inhabitants' Resonance or similar matters. The source also specifies one further question per session while it lasts. Renew after story's end with fresh signs, a Rouse Check and Ritual roll.
Chain: With Sustenance of the Earth and Compel the Inanimate, the group gains near-total control and near-omniscience over the place of power and surrounding land: three free land questions per caster per session; structures or trees warn of hostile approaches unless magically concealed; while there, the casters may mend up to five Aggravated damage per night in total, shared first-come-first-served.
Duration: Until story's end.'''),
]

formulae=[
('Pintura Corporal','Pintura Corporal','Body Paint',1,[75,76],'''Description: Produces shiny dark-brown fluid that stays liquid until painted or tattooed onto mortal or vampire skin. The alchemist tattoos or massages it into personalized patterns beyond mundane tattooing.
Ingredients: Alchemist's Blood, choleric mortal blood and tattoo ink, henna, marker fluid or another staining substance.
Activation Cost: One Rouse Check.
Dice Pools: Dexterity + Craft; Stamina + Resolve.
System: With 1–3 distillation successes the paint dries quickly, requiring Dexterity + Craft, Difficulty 3, to finish in time. With 6 or more, the subject may reshape it at any time after a week with Stamina + Resolve, Difficulty 5. The alchemist can change its colors while working, as can a subject successfully reshaping it.
Duration: Permanent unless erased with skin-colored Body Paint.'''),
('Horário de check-out','Horário de Check-out','Check-Out Time',1,[76],'''Description: Allows traveling thin-bloods to be shipped as literal corpses.
Ingredients: Alchemist's Blood, phlegmatic mortal blood, embalming fluid, myrrh and a frog skull.
Activation Cost: One Rouse Check.
System: Write a start and end date and time on the subject's left arm in Roman numerals; the subject may be the alchemist. They enter deep torpor at the start and cannot wake before the end unless someone rewrites it. Waking requires no Rouse Check. During this state they are indistinguishable from a corpse, without aura, nightly Rouse Checks or damage from incidental sunlight exposure or similar afflictions.
Duration: The written interval, at most nine nights.'''),
('Elevar','Elevar','Elevate',1,[76],'''Description: Known as El, this party brew heightens colors, sound, taste, energy and genuine reflexes, leaving glassy eyes and exuberant dancing. Kindred can experience it by feeding on someone who took it. Unlike high-Humanity Kindred using Blush of Life, it offers thin-bloods an alchemical workaround; it is commonly sold at parties.
Ingredients: Alchemist's Blood, sanguine mortal blood, fermented chocolate, rice vinegar, black coffee and often a recreational street drug.
Activation Cost: One Rouse Check.
Dice Pool: Stamina + Alchemy.
System: The drinker feels warmth and pleasure, relaxed muscles and sharpened nerves, gaining one die to Dexterity pools for the scene. It may carry ordinary drugs, whose effects change unpredictably, usually toward ecstatic stimulation. A poorly made dose feels good but instead gives a one-die Dexterity penalty.
Duration: One scene.'''),
('Mancha de comida','Mancha de Comida','Food Smear',1,[76,77],'''Description: A ketchup-like elixir marks its drinker or anointed subject so the alchemist can identify whoever later feeds on them.
Ingredients: Alchemist's Blood, melancholy mortal blood and a strongly colored condiment such as barbecue sauce, mustard or powdered cheese flavoring.
Activation Cost: One Rouse Check.
System: After consumption or contact marks a mortal or Kindred, the next person who feeds on them becomes recognizable to the maker by sight, sound or smell. If the alchemist has Auspex 2 or more, they know immediately when feeding occurs and, for about an hour, the feeder's direction but not distance.
Duration: The unconsumed or unapplied substance retains its mystical potential, but smells terrible after a week even refrigerated.'''),
('Fale com o coração','Fale com o Coração','Speak from the Heart',1,[77],'''Description: This soda-like elixir is called a crude “message in the ass” in California. A usually mortal carrier drinks it; the next vampire feeding on them receives the message.
Ingredients: A soft drink, alchemist's Blood, melancholy human blood, mercury and ink or paint.
Activation Cost: One Rouse Check.
System: Imprint the message while brewing. Grape soda carries at most seventy-one words; orange creates a sketched mental image for about a minute; lemon-lime conveys a brief vivid emotion. Whether a mortal drinking the carrier's blood also receives it remains untested in the source.
Duration: The message lasts about sixty seconds and persists in its carrier until death or someone drinks their blood.'''),
('Torpor Avançado','Torpor Avançado','Advanced Torpor',2,[77],'''Description: Induces a healing torpor as a last resort for thin-bloods.
Ingredients: Alchemist's Blood, choleric and phlegmatic mortal blood, neem extract, diazepam, diphenhydramine and chamomile flowers.
Activation Cost: One Rouse Check.
System: Produces a bright-pink watery fluid (or it is bled from the alchemist or vessel for other methods). Mixed with mortal blood, it immediately induces torpor of normal duration. Unlike ordinary torpor, Rouse Checks are still required for passing days and mending damage. If it ends below Hunger 5, the vampire may retain their current Hunger on waking. All vampires mend as vampires during it, even with a Thin-Blood Flaw that normally prevents this. If Hunger exceeds 5, regular torpor replaces it for the remaining duration.
Method exceptions: Athanor Corporis may tap a vein once per night until feeding again or reaching Hunger 5, without another distillation cost. A surviving Calcinatio vessel can be tapped again in a week and suffers five Aggravated Health damage per tapping.
Duration: Until the subject wakes from torpor.'''),
('Surpresa de luz negra','Surpresa de Luz Negra','Blacklight Surprise',2,[77,78],'''Description: Lends the sun's destructive force to an ordinary ultraviolet flashlight or blacklight.
Ingredients: Alchemist's Blood, sanguine and choleric mortal blood, sunflower seeds, hand sanitizer and luminol.
Activation Cost: One Rouse Check.
System: A coated UV source causes one Aggravated damage each turn its light strikes a vampire and provokes terror frenzy like sunlight. Kindred already harmed by ultraviolet take one additional damage.
Duration: At least an hour plus another hour per distillation success. A broken light source burns out the formula.'''),
('Estado Azul','Estado Azul','Blue State',2,[78],'''Description: A muddy cobalt-blue elixir, ingested or applied to skin, makes the subject obsess resentfully over the next wrong committed by a friend or ally.
Ingredients: Alchemist's Blood, melancholy and phlegmatic mortal blood and cobalt.
Activation Cost: One Rouse Check.
System: The subject cannot forgive: when a friend or ally next violates the subject's Convictions, the subject gains one Stain. A mortal instead holds a seemingly irrational, intractable grudge.
Duration: The Stain remains until the characters have at least a very uncomfortable conversation, as the source specifically states.'''),
('Pele de Diamante','Pele de Diamante','Diamond Skin',3,[78],'''Description: Protects fragile thin-bloods from blows and falls, and makes their skin glitter under neon. Less reliable than Tank, but potentially longer-lasting and more protective depending on the alchemist.
Ingredients: Alchemist's Blood, melancholy human blood, ground granite, diamonds or ceramics, and lotion or oil.
Activation Cost: One Rouse Check.
System: Converts Aggravated damage to Superficial up to a number of points equal to distillation successes. Only cutting, piercing and impact damage qualifies; fire, sunlight, sorcery and acid do not.
Duration: Until the allowance is exhausted; on a critical distillation win, the effect lasts a scene.'''),
('Pele de fogo','Pele de Fogo','Fire Skin',3,[78],'''Description: First created to safely superheat Athanor Corporis, it permits Kindred and brave mortals to enter fire. Powdered elemental salamander bone tastes bitter and ashen but grants its fiery sympathy.
Ingredients: Alchemist's Blood, powdered elemental salamander bone, tobacco and sulfur.
Activation Cost: One Rouse Check.
System: The drinker feels cold as small flames cover the skin. They do not spread, but the body becomes painfully hot. Bodily attacks gain one fire damage, increased to two after a successful grapple; only the additional damage counts as fire. Fire does not harm the user during the effect, but cold damage doubles.
Duration: One scene.'''),
('Redes de hospitais','Redes de Hospitais','Hospital Chains',3,[78,79],'''Description: A fibrous red spit or splash prevents Kindred and mortals from recovering wounds, prolonging a lesson in injury.
Ingredients: Alchemist's Blood, phlegmatic mortal blood, a sample of fatal carcinoma and hydrofluoric acid.
Activation Cost: One Rouse Check.
Dice Pool: Distillation roll versus Stamina.
System: Once it touches an injured subject, they cannot heal physical wounds by any means. Infused Blood is wasted and hospital treatment yields no improvement.
Duration: Two days per point of margin; on a critical win, two days per distillation success.'''),
('Pureza Marciana','Pureza Marciana','Martian Purity',3,[79],'''Description: Named for Mars, iron and choleric correspondences, this expels bloodborne disease as flaming gas. Some Princes force suspected plague carriers to take it under court supervision and a ready fire extinguisher.
Ingredients: Alchemist's Blood, choleric mortal blood, iron filings and gunpowder ash.
Activation Cost: One Rouse Check.
System: Only works on mortals or Kindred carrying a blood-transmissible infection. Ingestion forces impurities out through pores on the back as gas that ignites in air, causing the carrier two Aggravated damage. The Storyteller determines whether it works on a particular supernatural infection.
Duration: Two turns.'''),
('Máscara desligada','Máscara Desligada','Mask Off',3,[79],'''Description: Militant thin-bloods attack the Masquerade, especially at gatherings mixing Kindred and their vessels.
Ingredients: Alchemist's Blood, choleric and melancholy mortal blood, ground mustard seed, lemon juice, amphetamines and ground match heads.
Activation Cost: One Rouse Check.
Dice Pool: Distillation versus the target's Stamina + Resolve.
System: A reddish-yellow paste, created or bled from alchemist or vessel, becomes an acrid gas when loaded into an explosive and detonated, covering three by six meters. Blast and gas cause no damage. Full-blooded vampires using Blush of Life contest the distillation roll with Stamina + Resolve; losers have it end painfully and publicly and cannot use it again that night. With 1–3 distillation successes they have moments to hide before it takes effect. On a critical distillation win, losers also test fury frenzy at Difficulty 2.
Duration: The source lists one scene for the formula; the prohibition on Blush of Life explicitly lasts the night.'''),
('TLC','TLC','TLC',3,[79,80],'''Description: “This Lick Cares,” or “Tastes Like Chicken,” creates powder giving living animal blood the mystical qualities of mortal blood. It is sold widely to vampires avoiding human prey despite growing Blood Potency.
Ingredients: Alchemist's Blood, animal blood, choleric mortal blood, nettles, iron pieces and meat glue.
Activation Cost: One Rouse Check.
System: Produces a bluish-brown powder, or a substance bled and sifted from alchemist or vessel. Feed it to an animal so a vampire can feed on it as though human. Each distillation success enriches enough animal blood to sate one Hunger. Only the largest dogs can sate more than one without dying; horses, cattle and other large mammals contain enough to sate eight to ten Hunger when treated. Killing a TLC-treated animal cannot reduce Hunger to zero.'''),
('Troll, o Piedoso','Troll, o Piedoso','Troll the Pious',3,[80],'''Description: A pus-colored, wax-smelling paste resembling children's non-toxic glue induces religious discomfort and worse effects in those with True Faith.
Ingredients: Alchemist's Blood, melancholy mortal blood, used hot-tub water, cornstarch and a body hair from a living natural redhead with green eyes.
Activation Cost: One Rouse Check.
System: One batch coats about three square meters of floor (carpet is messy), one entire person, a dozen books or half a small workshop's tools. People believing in a benign higher power or working in religion suffer unease there or when their attention is drawn to a coated object: a one-die penalty to Social and Mental pools and Physical pools requiring strict concentration. True Faith sufferers instead lose two dice and experience horrifying visions expressing their fears and prejudices, possibly providing actual insight into evil. The penalty never affects a pool to which True Faith would be added, such as resisting vampires.
Duration: On a location, a few months; object untouched, two months; rarely handled, a month; frequently handled, a week. On a person, three days, with visibly waxy, oily skin on day one.'''),
('Imitador','Imitador','Copycat',4,[80],'''Description: Blurs the user's face and hair toward a blood donor's appearance. The underlying face shape remains, so close acquaintances notice an uncanny mismatch in good light; it still helps blend into crowds or fool strangers. Some resonance must exist between alchemist and donor when both samples are collected, established through shared food, psychedelics, sex or another exciting shared activity.
Ingredients: Alchemist's Blood, choleric and phlegmatic mortal blood, a glass mirror, donor blood, Boquila trifoliolata leaves and chameleon skin.
Activation Cost: One Rouse Check.
System: The drinker feels wetness, itching and pulling over the face throughout the effect, ending in mildly itchy white residue like dried glue. Someone recognizing the donor by sight needs Intelligence + Awareness at Difficulty equal to distillation successes to distinguish them.
Duration: Twenty minutes, generally a scene if used wisely.'''),
('Condutor Meio Vivo','Condutor Meio Vivo','Half-Living Conductor',4,[81],'''Description: Protects from electricity and turns an ordinarily secondary vampiric concern into a dangerous weapon.
Ingredients: Alchemist's Blood, choleric and sanguine mortal blood, molten conducting metal (gold, silver, copper or aluminum), ground rubber and thunderstorm rainwater.
Activation Cost: One Rouse Check.
Dice Pools: Stamina + Alchemy; Dexterity + Alchemy for a redirected ranged attack.
System: Immune to physical damage from all electrical sources, including lightning, tasers, bare wire and supernatural abilities. When exposed, may amplify and redirect electricity in an arc from fingers, mouth or eyes. A ranged attack deals margin + 2 Superficial Health damage to vampires, Aggravated to mortals. At 1–3 distillation successes protection remains but redirected attacks gain no additional Health damage. At six or more successes, attacks deal Aggravated Health damage to mortals and supernatural beings alike.
Duration: One scene or until voluntarily ended.'''),
('Estado Vermelho','Estado Vermelho','Red State',4,[81],'''Description: A hypnotic potion or ointment erases memories of an ally's or associate's wrongdoing.
Ingredients: Alchemist's Blood, sanguine and phlegmatic mortal blood and iron oxide.
Activation Cost: One Rouse Check.
System: Applied or consumed, induces moral forgetfulness. The next time a close trusted person violates the subject's Convictions or wrongs them, those memories disappear and cannot be restored. Even hearing an accusation causes the idea of the crime to fade within moments.
Duration: Permanent until the target absorbs a choleric Dyscrasia.'''),
('Vitae MSG','Vitae MSG','Vitae MSG',4,[81,82],'''Description: A pleasure-enhancing ointment encourages vampires to feed on selected vessels, facilitating Blood Bonds, infection or delivery of another formula. Many Ventrue prize it.
Ingredients: Alchemist's Blood, sanguine mortal blood, MSG, powdered sugar and imitation (not genuine) Chanel No. 5.
Activation Cost: One Rouse Check.
System: A clear watery fluid smelling faintly of vanilla and jasmine works only after being rubbed onto a person or animal. Any vampire seeing or smelling them feels an intense urge to feed. Resist with one Willpower point or accept one additional Hunger; after another thirty minutes nearby, feed or pay again. It partially offsets the Ventrue Bane: feeding outside their preferred category costs one less Willpower.
Duration: Once anointed, the urge lasts until the next dawn if the subject survives.'''),
('Fluxo de Saturno','Fluxo de Saturno','Saturn’s Flux',5,[82],'''Description: A politically dangerous drug that breaks Blood Bonds; authoritarian domains may execute possessors, confiscate it or reserve access for the powerful. It must be freebased.
Ingredients: Alchemist's Blood, phlegmatic mortal blood, lead, laxative and horsehair.
Activation Cost: One Rouse Check.
System: Smoke the brittle gray fingernail-sized pellet in a steel pipe over ashes, taking precautions with the open flame. Within twenty-four hours the user painfully and bloodily excretes the Blood Bond. Mortals suffer no harm; Kindred suffer one Aggravated damage as the influence resists expulsion from their withered digestive system.
Duration: Takes effect within a day, possibly waking Kindred with cramps. Unused pellets seem to keep indefinitely, though the source notes the product had existed only two years and its eventual shelf life was unknown.'''),
]

def normalized(text):
 text=re.sub(r'(?m)^(##\s*)(.+)$',lambda m:m[1]+re.sub(r' +',' ',m[2]).strip(),text)
 return re.sub(r'(?<=\S) {2,}(?=\S)',' ',text)

all_titles=[row[0] for row in rituals+formulae]+['Rituais de Nível 1','Rituais de Nível 2','Rituais de Nível 3','Rituais de Nível 4','Rituais de Nível 5','RITUAIS EM CADEIA','Fórmulas de Nível 1','Fórmulas de Nível 2','Fórmulas de Nível 3','Fórmulas de Nível 4','Fórmulas de Nível 5','Novo Sangue Fino','Eu preparo, você bebe']
def sections(text,en):
 labels='Description|Requirements|Ingredients|Process|System|Duration|Activation Cost|Dice Pools?|Method exceptions|Chain|Source terminology' if en else 'Ingredientes|Processo|Sistema|Duração|Pré-requisito|Custo de ativação|Paradas de Dados|Pools de Dados|Athanor Corporis|Calcinatio|Corrente'
 parts=re.split(r'(?<!\w)('+labels+r')\s*:\s*',text,flags=re.I)
 out=[{'title':'Description' if en else 'Descrição','text':parts[0].strip()}] if parts[0].strip() else []
 for i in range(1,len(parts),2):
  title=parts[i].strip()
  if not en:title={'pools de dados':'Parada','paradas de dados':'Parada','custo de ativação':'Custo','pré-requisito':'Requisitos','corrente':'Ritual em Cadeia'}.get(title.lower(),title)
  out.append({'title':title,'text':parts[i+1].strip()})
 return out

for kind,data in [('ritual',rituals),('formula',formulae)]:
 for heading,legacy,en,level,numbers,english in data:
  text='\n\n'.join(normalized(json.loads((work/'pages'/book/f'{n:04}.json').read_text(encoding='utf-8'))['content']) for n in numbers)
  match=re.search(r'^## '+re.escape(heading)+r'\s*\n',text,re.M|re.I);assert match,heading
  text=text[match.end():]
  text=re.split(r'\n## (?:'+'|'.join(re.escape(t) for t in all_titles)+r')\s*\n',text,1,flags=re.I)[0]
  text=re.sub(r'^##\s+','',text,flags=re.M)
  text=re.sub(r'(?<=[a-z,])\n\n(?=[a-z])',' ',text)
  corrections={'Teste de Despertar':'Teste de Sangue','Testes de Despertar':'Testes de Sangue','Teste de Incitação':'Teste de Sangue','Testes de Incitação':'Testes de Sangue','um cheque Rouse':'um Teste de Sangue','Um Rouse Check':'Um Teste de Sangue','Resolução':'Determinação','Resistência + Atletismo':'Vigor + Atletismo','Compostura':'Autocontrole','Consciência':'Percepção','Saúde':'Vitalidade','dano de Vida':'dano de Vitalidade','Acadêmicos':'Erudição','Ofício':'Ofícios','O lançador':'O conjurador','O fundidor':'O conjurador','o lançador':'o conjurador','o fundidor':'o conjurador','piscinas':'paradas','reservas':'paradas','manchas do rastreador':'Máculas da trilha','1 Mancha':'1 Mácula','2 manchas':'2 Máculas','1 mancha':'1 Mácula','Manchas permanentes':'Máculas permanentes','Manchas se torna permanente':'Máculas se torna permanente','genialidade de um local loci':'um genius loci','mantêlos':'mantê-los','engolila':'engoli-la','ingredientechave':'ingrediente-chave','sangue-fraco dos Mercurianos':'Sangue dos Mercurianos','não é uma resposta exata.\n\ncópia.':'não é uma cópia exata.'}
  for old,new in corrections.items():text=text.replace(old,new)
  if heading=='Pele de Diamante':text=text.replace('Vampire:\n\nGuia do Mascarado','Vampiro: Guia do Jogador')
  ptsections=sections(text,False);ensections=sections(english,True)
  discipline='Feitiçaria de Sangue' if kind=='ritual' else 'Alquimia do Sangue-Fraco'
  ptsections.insert(1,{'title':'Requisitos','text':f'{discipline} {level}.'})
  ensections.insert(1,{'title':'Requirements','text':f'{"Blood Sorcery" if kind=="ritual" else "Thin-Blood Alchemy"} {level}.'})
  requirements={'disciplines':{discipline:level}}
  if heading in ['Apreensão Elemental','Abrigo Elemental','Ataque Elemental']:requirements['prerequisiteAlternatives']=[['Feitiçaria Koldúnica: '+element for element in ['Água','Fogo','Ar','Terra']]+['Feitiçaria Koldúnica','Koldunic Sorcery']]
  if heading=='Apreensão Elemental':ptsections.append({'title':'Terminologia da fonte','text':'O PDF traduzido usa “Autocontrole + Impulso” como exemplo de parada. Essa referência é ambígua: confirme com o Narrador a Característica apropriada, sem presumir que seja Impulso de Sangue.'})
  if kind=='ritual':
   general=json.loads((repo/'scripts/reviewed-content/clinging-of-the-insect.json').read_text(encoding='utf-8'))['versions'][0]['descriptions']
   for locale,values in [('pt-BR',ptsections),('en',ensections)]:
    section=dict(general[locale][-1]);section['text']+='\n\n'+('[Original general rules](/rules/source?book=core-v5&page=274)' if locale=='en' else '[Página original das regras gerais](/rules/source?book=core-v5&page=274)');values.append(section)
   if heading in ['Ataque Elemental','Rei Pescador']:
    ptsections.append({'title':'Regras gerais dos Rituais em Cadeia','text':'Uma cadeia reúne ao menos três Rituais, de quaisquer níveis, com um Ritual de nível 5 como eixo. Todos devem ser conjurados a até dez metros uns dos outros e todos precisam ter sucesso. O efeito em cadeia do eixo substitui os efeitos individuais; uma única falha rompe a cadeia.'})
    ensections.append({'title':'General chained Ritual rules','text':'A chain comprises at least three Rituals of any level, with a level 5 Ritual as its hub. All must be cast within ten meters of one another and all must succeed. The hub’s chained effect replaces the individual effects; any failure breaks the chain.'})
  refs=list(numbers)
  if heading=='Rei Pescador':refs=[73]+refs
  if heading=='Alma do Hemonculus':
   refs += [135,136]
   profile='\n\n'.join(normalized(json.loads((work/'pages'/book/f'{n:04}.json').read_text(encoding='utf-8'))['content']) for n in [135,136]).split('## Hemônculo\n',1)[1].split('## Salamandra',1)[0].strip()
   profile=re.sub(r'(?<=[a-z,])\n\n(?=[a-z])',' ',profile)
   for old,new in corrections.items():profile=profile.replace(old,new)
   ptsections.append({'title':'Hemônculo: natureza e limites','text':profile})
   ensections.append({'title':'Homunculus: nature and limitations','text':'Distinct from a necromancer’s homuncular servant, this stunted, ill-tempered mortal clone is about 60–100 cm tall and has none of its maker’s post-mortem memories. Its mortal Attributes and Skills are one lower, minimum 1, with half the maker’s Health and one Willpower. It cannot become a ghoul, be Embraced or Blood Bound, and feeding on it is repellent and gives no nourishment. Its fingerprints and scientifically tested blood match the maker, but it provides no arcane connection to them. Destroying one can supply convincing DNA evidence of the maker’s death.\n\nIt must obey every command but may obey the letter while frustrating the intent. Others embrace the relationship, receive pleasures their maker could not pursue in life, and may die to protect them. Even resentful ones must obey and can work in daylight. Old-guard Tremere also give homunculi of themselves as apology gifts, placing a screaming, recognizable copy of themselves at a wronged party’s mercy.'})
  match=next((x for x in candidates if x['book']==book and x['name']==legacy),None)
  id=match['id'] if match else re.sub('[^a-z0-9]+','-',f'{book}-{kind}-{discipline}-{legacy}'.lower())
  ptname={'Tiamat Glistens':'Brilho de Tiamat','Alma do Hemonculus':'Alma do Hemônculo','Redes de Hospitais':'Correntes Hospitalares'}.get(legacy,legacy)
  version={'id':id+'-'+book,'book':book,'level':level,'sourceTitle':'Sigilos de Sangue V5, PDF pp. '+', '.join(map(str,refs)),'sourceLanguage':'pt-BR','pdfSha256':source['sha256'],'pages':[{'pdfPage':n,'printedPage':n-2} for n in refs],'requirements':requirements,'descriptions':{'pt-BR':ptsections,'en':ensections}}
  entry={'id':id,'kind':kind,'names':{'pt-BR':ptname,'en':en},'aliases':list(dict.fromkeys([ptname,legacy,heading,en])),'discipline':discipline,'level':level,'versions':[version]}
  (repo/'scripts/reviewed-content'/f'{id}.json').write_text(json.dumps(entry,ensure_ascii=False,indent=2),encoding='utf-8')
koldun_names=['Feitiçaria Koldúnica: '+element for element in ['Água','Fogo','Ar','Terra']]
for element,en_element in [('Água','Water'),('Fogo','Fire'),('Ar','Air'),('Terra','Earth')]:
 name='Feitiçaria Koldúnica: '+element;en='Koldunic Sorcery: '+en_element
 id=re.sub('[^a-z0-9]+','-',f'{book}-power-Feitiçaria de Sangue-{name}'.lower())
 pt=[('Descrição',f'Feitiçaria Tzimisce ligada ao elemento {element}. A iniciação estabelece, segundo os kolduny, um Laço de Sangue com a terra e estende os sentidos pelo elemento escolhido.'),('Requisitos','Tzimisce. Deve adquirir uma forma de Feitiçaria Koldúnica com seu primeiro ponto em Feitiçaria de Sangue. Cada elemento adicional exige escolher este poder novamente, com outro elemento.'),('Iniciação','Passe uma semana ou mais num local selvagem, geralmente guiado por um koldun mais velho. O lugar deve estar ligado por uma veia da terra ao domínio de Kupala nos Cárpatos ou a território já estabelecido pelo Clã Antigo. Na iniciação, abra uma veia e mergulhe o braço na terra, água, fogo ou ar. Os kolduny preferem a lua nova por razões rituais e menor risco de ataque lupino.'),('Custo','Um Teste de Sangue e dano agravado voluntário à Vitalidade.'),('Sistema','Reabra a cicatriz de iniciação. Pode sofrer um dano agravado por ponto de Feitiçaria de Sangue possuído; cada ponto amplia os sentidos conforme a tabela. Percebe através do elemento: um koldun de fogo usa chamas, fogões, fornalhas, aquecedores e cigarros acesos no alcance. Para perceber ocultação mística, como Ofuscação, dispute Determinação + Feitiçaria de Sangue contra Raciocínio ou Determinação + Ofuscação, ou a Característica sobrenatural pertinente.'),('Sentidos estendidos','| Dano agravado voluntário | Raio |\n| --- | --- |\n| 1 | 15 metros |\n| 2 | 90 metros |\n| 3 | 500 metros |\n| 4 | 1,5 quilômetro |\n| 5 | 8 quilômetros |'),('Duração','Uma cena. Pode renovar no mesmo alcance a qualquer momento da noite com outro Teste de Sangue e um dano agravado à Vitalidade. O efeito termina completamente ao nascer do sol.')]
 enrows=[('Description',f'Tzimisce sorcery attuned to {en_element}. Initiation establishes what kolduny describe as a Blood Bond with the land, extending perception through the chosen element.'),('Requirements','Tzimisce. Take a Koldunic Sorcery form with the first dot of Blood Sorcery. Each additional element requires taking this power again for that element.'),('Initiation','Spend at least a week in a wild place, usually guided by a senior koldun, often the sire. An earth’s vein must connect it to Kupala’s demon-haunted Carpathian territory or land already claimed by the Old Clan. Open a vein and immerse the arm in earth, water, fire or air. New moons are favored for ritual reasons and somewhat reduced risk of werewolf attack.'),('Cost','One Rouse Check and voluntary Aggravated Health damage.'),('System','Reopen the initiation scar. Suffer up to one Aggravated Health damage per Blood Sorcery dot, extending senses by the table. Perceive through the element: a fire koldun uses flames, stoves, furnaces, heaters and lit cigarettes in range. Mystically concealed beings, such as Obfuscated vampires, can be perceived with Resolve + Blood Sorcery versus Wits or Resolve + Obfuscate or the relevant supernatural trait.'),('Extended senses','| Voluntary Aggravated damage | Radius |\n| --- | --- |\n| 1 | 15 meters |\n| 2 | 90 meters |\n| 3 | 500 meters |\n| 4 | 1.5 kilometers |\n| 5 | 8 kilometers |'),('Duration','One scene. Renew the same reach at any time that night with another Rouse Check and one Aggravated Health damage. It expires completely at sunrise.')]
 version={'id':id+'-'+book,'book':book,'level':1,'sourceTitle':'Sigilos de Sangue V5, PDF p. 63','sourceLanguage':'pt-BR','pdfSha256':source['sha256'],'pages':[{'pdfPage':63,'printedPage':61}],'requirements':{'disciplines':{'Feitiçaria de Sangue':1},'clans':['Tzimisce'],'firstDisciplinePowerGroup':koldun_names},'descriptions':{'pt-BR':[{'title':t,'text':v} for t,v in pt],'en':[{'title':t,'text':v} for t,v in enrows]}}
 entry={'id':id,'kind':'power','names':{'pt-BR':name,'en':en},'aliases':[name,en],'discipline':'Feitiçaria de Sangue','level':1,'versions':[version]}
 (repo/'scripts/reviewed-content'/f'{id}.json').write_text(json.dumps(entry,ensure_ascii=False,indent=2),encoding='utf-8')
print('24 Blood Sigils Rituals, 20 formulae and four Koldunic element choices prepared; three legacy levels corrected')
