const Region = `description: Tables to randomly generate regions for a fantasy setting.
source: Freebooters on the Frontier 2nd Edition by Jason Lutes

import:
  - FotF_RegionFeatures

output: |
  ## {{rollTable regionNameTemplate}}
  {{setState state 'currentClimate' (ws regionClimate)}}{{setState state 'size' (rollTable regionSize)}}
  {{ws (lookup regionTerrain state.currentClimate)}}, {{state.currentClimate}}, {{state.size}}, {{ws regionAlignment.neutral}}

  ### Features: {{setState state 'featureCount' (roll (lookup regionFeatureCount state.size))}}
  {{#loop state.featureCount FotF_RegionFeatures_output}}{{/loop}}

state:
  currentClimate: temperate
  size: sizable
  featureCount: 1

regionNameTemplate:
  dice: 1d12
  entries:
    - 1..4||(The) {{pick regionNamePieces.ADJECTIVE}} {{pick regionNamePieces.TERRAIN}}
    - 5..7||{{pick regionNamePieces.TERRAIN}} of (the) {{pick regionNamePieces.NOUN}}
    - 8||The {{pick regionNamePieces.TERRAIN}} {{pick regionNamePieces.ADJECTIVE}}
    - 9..10||(The) {{pick regionNamePieces.NOUN}} {{pick regionNamePieces.TERRAIN}}
    - 11||(The) {{pick regionNamePieces.NOUN}}'s {{pick regionNamePieces.ADJECTIVE}} {{pick regionNamePieces.TERRAIN}}
    - 12||{{pick regionNamePieces.ADJECTIVE}} {{pick regionNamePieces.TERRAIN}} of (the) {{pick regionNamePieces.NOUN}}
    
regionSize:
  dice: 1d12
  entries:
    - 1||small
    - 2..4||sizable
    - 5..9||large
    - 10..11||expansive
    - 12||vast

regionFeatureCount: 
  small: 1d4
  sizable: 2d6
  large: 3d8
  expansive: 4d10
  vast: 5d12

regionClimate: frigid,temperate,torrid||2,8,2

regionTerrain:
  frigid: volcanic highland,mountains|glacier,highland|hills,hilly boreal forest|taiga,tundra|steppe|wasteland,boreal forest|taiga||1,2,2,2,3,2
  temperate: volcanic highland,mountains|glacier,mountains,highland|hills,hilly forest,woodland|forest,wasteland|marsh|swamp,lowland|plains|prairie||1,1,1,2,1,3,1,2
  torrid: volcanic highland,mountains,highland|hills|dunes,hilly jungle|rainforest,jungle|rainforest,wetland|marsh|swamp,lowland|desert|flats||1,2,2,1,2,1,3

regionAlignment:
  good: evil,chaotic,neutral,lawful,good||1,2,2,2,5
  neutral: evil,chaotic,neutral,lawful,good||1,2,6,2,1
  evil: evil,chaotic,neutral,lawful,good||5,2,2,2,1
  lawful: evil,chaotic,neutral,lawful,good||2,1,2,5,2
  chaotic: evil,chaotic,neutral,lawful,good||2,6,1,1,2

regionNamePieces:
  TERRAIN: Bay,Bluffs,Bog,Cliffs,Desert,Downs,Dunes,Expanse,Fells,Fen,Flats,Foothills,Forest,Groves,Heath,Heights,Hills,Hollows,Jungle,Lake,Lowland,March,Marsh,Meadows,Moor,Morass,Mounds,Mountains,Peaks,Plains,Prairie,Quagmire,Range,Reach,Sands,Savanna,Scarps,Sea,Slough,Sound,Steppe,Swamp,Sweep,Teeth,Thicket,Upland,Wall,Waste,Wasteland,Woods
  ADJECTIVE: Ageless,Ashen,Black,Blessed,Blighted,Blue,Broken,Burning,Cold,Cursed,Dark,Dead,Deadly,Deep,Desolate,Diamond,Dim,Dismal,Dun,Eerie,Endless,Fallen,Far,Fell,Flaming,Forgotten,Forsaken,Frozen,Glittering,Golden,Green,Grim,Holy,Impassable,Jagged,Light,Long,Misty,Perilous,Purple,Red,Savage,Shadowy,Shattered,Shifting,Shining,Silver,White,Wicked,Yellow
  NOUN: Ash,Bone,Darkness,Dead,Death,Desolation,Despair,Devil,Doom,Dragon,Fate,Fear,Fire,Fury,Ghost,Giant,God,Gold,Heaven,Hell,Honor,Hope,Horror,King,Life,Light,Lord,Mist,Peril,Queen,Rain,Refuge,Regret,Savior,Shadow,Silver,Skull,Sky,Smoke,Snake,Sorrow,Storm,Sun,Thorn,Thunder,Traitor,Troll,Victory,Witch`;

const Creatures = `
description: Tables to randomly generate creatures for a fantasy setting.
source: Freebooters on the Frontier 2nd Edition by Jason Lutes

import: 
  - FotF_Details

output: "{{rollTable CREATURE}}"

CREATURE: 
  dice: 1d12
  entries:
    - "1..4||Monster: {{MONSTER}}"
    - "5..9||Beast: {{BEAST}}"
    - "10..12||Humanoid: {{HUMANOID}}"

# ============================================================================
# CREATURE TYPES
# ============================================================================

MONSTER: "{{rollTable monsterType}}"

monsterType: 
  dice: 1d12
  entries:
    - "1||{{rollTable LEGENDARY_MONSTER}}"
    - "2..3||{{rollTable EXTRAPLANAR}}"
    - "4..12||{{rollTable FEARSOME_BEAST}}"

DRAGONTITAN: 
  - Dragon
  - Titan

LEGENDARY_MONSTER:
  dice: 1d12
  entries:
    - "1..2||Oddity [{{rollTable ODDITY}}] (huge)"
    - "3..4||{{rollTable ELEMENT}} {{rollTable DRAGONTITAN}} (huge)"
    - "5..6||{{BEAST}} {{rollTable DRAGONTITAN}} (huge)"
    - "7..9||{{rollTable COLOR}} {{rollTable DRAGONTITAN}} (huge)"
    - "10..12||{{BEAST}} (huge)"

DIVINEDEMONIC: 
  - Divine
  - Demonic

EXTRAPLANAR:
  dice: 1d12
  entries:
    - "1||{{rollTable DIVINEDEMONIC}} Lord [{{rollTable ASPECT}}]"
    - "2..3||{{rollTable ELEMENT}} Elemental"
    - 4..6||Demon
    - "7..12||{{rollTable MAJORUNDEAD}}"

MAJORUNDEAD:
  dice: 1d12
  entries:
    - "1||Lich [{{rollTable MAGIC}}]"
    - 2..4||Vampire
    - 5..7||Death Knight
    - 8..10||Wraith
    - 11..12||Ghost

MINORUNDEAD:
  dice: 1d12
  entries:
    - 1..2||Zombie
    - 3..4||Skeleton
    - 5..6||Ghoul
    - 7..8||Wight
    - 9..10||Specter
    - 11..12||Shadow

FEARSOME_BEAST:
  dice: 1d12
  entries:
    - "1..3||{{BEAST}}, ability: {{rollTable ABILITY}}"
    - "4..5||{{BEAST}}, oddity: {{rollTable ODDITY}}"
    - "6..7||Chimera: {{BEAST}}/{{BEAST}}"
    - "8..10||Slime/Ooze"
    - "11..12||Plant/Fungus"
  
BEAST: "{{rollTable beastType}}"

beastType:
  dice: 1d12
  entries:
    - "1..2||{{slashSplit (rollTable WATERGOING)}}"
    - "3..5||{{slashSplit (rollTable AIRBORNE)}}"
    - "6..12||{{slashSplit (rollTable EARTHBOUND)}}"

WATERGOING: 
  - whale/narwhal
  - squid/octopus
  - dolphin/shark/alligator
  - turtle/clam/snail/crab
  - fish/eel/snake
  - frog/toad
  - jelly/anemone
  - insect/barnacle
  
AIRBORNE: 
  - pteranadon/condor
  - eagle/owl/hawk/falcon
  - heron/crane/ostrich
  - crow/raven/gull
  - songbird/parrot
  - chicken/duck/goose
  - bee/wasp/hornet/locust
  - butterfly/moth/mosquito

EARTHBOUND: 
  - dinosaur/elephant
  - ox/rhino/bear/apex hunter
  - deer/horse/camel
  - panther/wolf/boar
  - snake/lizard/armadillo
  - mouse/rat/weasel/cat
  - ant/centipede/scorpion
  - slug/worm/tick/beetle

HUMANOID: "{{rollTable humanoidType}}"

humanoidType:
  dice: 1d12
  entries: 
    - "1..2||{{rollTable RAREHUMANOID}}"
    - "3..5||{{rollTable UNCOMMONHUMANOID}}"
    - "6..12||{{rollTable COMMONHUMANOID}}"

RAREHUMANOID:
  dice: 1d12
  entries: 
    - "1..2||{{rollTable MAJORUNDEAD}}"
    - "3..4||Lycanthrope [{{rollTable EARTHBOUND}}]"
    - "5..8||{{BEAST}}-folk"
    - 9..10||Fay/Fairy (tiny)
    - 11..12||Elf

UNCOMMONHUMANOID:
  dice: 1d12
  entries:
    - 1||Cyclops/Giant (huge)
    - 2..3||Ogre/Troll (large)
    - "4..7||{{rollTable MINORUNDEAD}}"
    - 8||Lizardfolk/Merfolk
    - 9||Catfolk/Birdfolk
    - 10..12||Dwarf/Gnome (small)

COMMONHUMANOID:
  dice: 1d12
  entries:
    - 1..2||Orc/Hobgoblin/Gnoll
    - 3..5||Goblin/Kobold (small)
    - 6..7||Half-Orc/Half-Elf etc.
    - 8..9||Halfling (small)
    - 10..12||Mixed Party (group)`;

const RegionFeatures = `description: Tables to randomly generate region features for a fantasy setting.
source: Freebooters on the Frontier 2nd Edition by Jason Lutes

import:
  - FotF_Creatures
  - FotF_Details

output: "{{rollTable FEATURE}}"

FEATURE:
  dice: 1d12
  entries:
    - "1..4||Creature: {{FotF_Creatures_output}}"
    - "5||Hazard: {{rollTable HAZARD}}"
    - "6||Obstacle: {{rollTable OBSTACLE}}"
    - "7||Area: {{rollTable AREA}}"
    - "8||Named Place: {{rollTable NAMEDPLACE}}"
    - "9..11||Site: {{rollTable SITE}}"
    - "12||Faction Presence: {{FACTION}}"

# ============================================================================
# HAZARD TABLES
# ============================================================================

HAZARD:
  dice: 1d12
  entries:
    - "1||{{rollTable hazardUnnatural}}"
    - "2..12||{{rollTable hazardNatural}}"

hazardUnnatural:
  dice: 1d12
  entries:
    - "1..5||Taint/Blight/Curse - An evil or corrupting influence permeates this area"
    - "6..9||Magical [{{rollTable MAGIC}}], {{rollTable hazardNatural}}"
    - "10..11||Planar [{{rollTable ELEMENT}}], {{rollTable hazardNatural}}" 
    - "12||Divine [{{rollTable ASPECT}}], {{rollTable hazardNatural}}" 

hazardNatural:
  dice: 1d12
  entries:
    - "1||Hazard stems from a strange phenomenon: {{rollTable ODDITY}}"
    - 2||Tectonic/Volcanic - Earthquake, lava flow, geothermal danger
    - 3..4||Unseen Pitfall - Chasm, crevasse, abyss, rift, cliff
    - 5..6||Ensnaring - Bog, mire, tarpit, quicksand, sinking mud
    - 7||Defensive - Trap created by local CREATURE or FACTION
    - 8..10||Meteorological - Blizzard, thunderstorm, sandstorm, hurricane
    - 11||Seasonal - Fire, flood, avalanche, migration, hibernation
    - 12||Impairing - Mist, fog, murk, gloom, miasma, blindness

# ============================================================================
# OBSTACLE TABLES
# ============================================================================

OBSTACLE:
  dice: 1d12
  entries:
    - "1||{{rollTable obstacleUnnatural}}"
    - "2..12||{{rollTable obstacleNatural}}"

obstacleUnnatural:
  dice: 1d12
  entries:
    - "1..7||Magical [{{rollTable MAGIC}}], {{rollTable areaNatural}}"
    - "8..11||Planar [{{rollTable ELEMENT}}], {{rollTable areaNatural}}"
    - "12||Divine [{{rollTable ASPECT}}], {{rollTable areaNatural}}"

obstacleNatural:
  dice: 1d12
  entries:
    - "1||Obstacle stems from a strange phenomenon: {{rollTable ODDITY}}"
    - 2..3||Defensive - Barrier created by local creature or faction
    - 4..6||Impenetrable - Cliff, escarpment, crag, bluff, wall
    - 7..9||Penetrable - Dense forest/jungle, dense underbrush, impenetrable vegetation
    - 10..12||Traversable - River, ravine, crevasse, chasm, abyss, canyon

# ============================================================================
# AREA TABLES
# ============================================================================

AREA:
  dice: 1d12
  entries:
    - "1||{{rollTable areaUnnatural}}"
    - "2..12||{{rollTable areaNatural}}"

areaUnnatural:
  dice: 1d12
  entries:
    - "1..7||Magical [{{rollTable MAGIC}}], {{rollTable areaNatural}}"
    - "8..11||Planar [{{rollTable ELEMENT}}], {{rollTable areaNatural}}"
    - "12||Divine [{{rollTable ASPECT}}], {{rollTable areaNatural}}"

areaNatural:
  dice: 1d12
  entries:
    - "1||Area distinguished by strange phenomena: {{rollTable ODDITY}}"
    - "2..3||{{rollTable hazardNatural}}, expand its reach to define the area"
    - "4..5||{{rollTable obstacleNatural}}, expand its footprint to define the area"
    - 6..7||Hunting/Gathering Ground - Territory of local creature
    - 8..9||Claimed Territory - Territory claimed by local faction
    - 10..12||Difficult Terrain - Icefield, rocky land, dense forest, scree, swamp

# ============================================================================
# NAMED PLACE TABLES
# ============================================================================

NAMEDPLACE:
  dice: 1d12
  entries:
    - "1..2||The {{pick placeWords.PLACE}}"
    - "3..4||The {{pick placeWords.ADJECTIVE}} {{pick placeWords.PLACE}}"
    - "5..6||The {{pick placeWords.PLACE}} of (the) {{pick placeWords.NOUN}}"
    - "7..8||(The) {{pick placeWords.NOUN}}'s {{pick placeWords.PLACE}}"
    - "9..10||{{pick placeWords.PLACE}} of the {{pick placeWords.ADJECTIVE}} {{pick placeWords.NOUN}}"
    - "11..12||The {{pick placeWords.ADJECTIVE}} {{pick placeWords.NOUN}}"

placeWords:
  PLACE: Barrier,Beach,Bowl,Camp,Cave,Circle,City,Cliff,Crater,Crossing,Crypt,Den,Ditch,Falls,Fence,Field,Fort,Gate,Grove,Hill,Hole,Hut,Keep,Lake,Marsh,Meadow,Mountain,Pit,Post,Ridge,Ring,Rise,Road,Rock,Ruin,Shrine,Spire,Spring,Stone,Tangle,Temple,Throne,Tomb,Tower,Town,Tree,Vale,Valley,Village,Wall
  ADJECTIVE: Ancient,Ashen,Black,Bloody,Blue,Bright,Broken,Burning,Clouded,Copper,Cracked,Dark,Dead,Doomed,Endless,Fallen,Far,Fearsome,Floating,Forbidden,Frozen,Ghostly,Gloomy,Golden,Grim,Hidden,High,Iron,Jagged,Lonely,Lost,Low,Near,Petrified,Red,Screaming,Sharp,Shattered,Shifting,Shining,Shivering,Shrouded,Silver,Stalwart,Stoney,Sunken,Thorny,Thundering,White,Withered
  NOUN: Arm,Ash,Blood,Child,Cinder,Corpse,Crystal,Dagger,Death,Demon,Devil,Doom,Eye,Fear,Finger,Fire,Foot,Ghost,Giant,Goblin,God,Gold,Hand,Head,Heart,Hero,Hope,King,Knave,Knight,Muck,Mud,Priest,Queen,Sailor,Silver,Skull,Smoke,Souls,Spear,Spirit,Stone,Sword,Thief,Troll,Warrior,Water,Witch,Wizard

# ============================================================================
# SITE TABLES
# ============================================================================

SITE:
  dice: 1d10
  entries:
    - 1..2||DUNGEON - See dungeon generation procedure
    - "3..4||{{rollTable LAIR}}"
    - "5..6||{{rollTable RUIN}}"
    - "7||{{rollTable OUTPOST}}"
    - "8..9||{{rollTable LANDMARK}}"
    - "10||{{rollTable RESOURCE}}"

LAIR:
  dice: 1d12
  entries:
    - 1..2||Inhabited RUIN
    - 4..6||Inhabited cave
    - 7..8||Den/Burrow/Hideout
    - 9||Hive/Aerie/Nest
    - 10||Hovel/Hut/Encampment
    - 11..12||Farmstead/Homestead

RUIN:
  dice: 1d12
  entries:
    - 1..2||Tomb/Crypt/Necropolis
    - 3..4||Shrine/Temple
    - 5..6||Mine/Quarry/Excavation
    - 7..8||Shrine/Temple
    - 9..10||Ancient outpost
    - 11..12||Ancient SETTLEMENT

OUTPOST:
  dice: 1d12
  entries:
    - "1||{{pick UnnaturalOutpost}}"
    - 2..3||FACTION outpost
    - 4..5||Tollhouse/Checkpoint
    - 6..8||Meeting/Trading post
    - 9..11||Camp/Roadhouse/Inn
    - 12||Tower/Fort/Base

UnnaturalOutpost:
  - "{{rollTable MAGIC}} outpost"
  - "{{rollTable ELEMENT}} outpost"
  - "{{rollTable ASPECT}} outpost"

LANDMARK:
  dice: 1d12
  entries:
    - "1||Odd: {{pick ODDITY}} landmark"
    - 2..4||Plant/Tree-based landmark
    - 5..7||Earth/Rock-based landmark
    - 8..9||Water-based landmark
    - 10||FACTION-based landmark
    - 11||Megalith/Obelisk/Statue
    - "12||{{rollTable MAGIC}} landmark"

RESOURCE:
  dice: 1d12
  entries:
    - "1||Odd: {{pick ODDITY}} resource"
    - 2..4||Game/Hide/Fur
    - 5..6||Timber/Clay/Stone
    - 7..8||Herb/Spice/Dye
    - 9..10||Copper/Tin/Iron
    - 11||Silver/Gold/Gems
    - "12||{{rollTable MAGIC}} resource"

# ============================================================================
# FACTION TABLES
# ============================================================================

FACTION: "{{rollTable factionTypeTable}}, {{rollTable factionGoalTable}}, {{rollTable factionConditionTable}}"

factionTypeTable:
  - Commoner/Peasant
  - Criminal/Corrupt
  - Rebel/Subversive
  - Martial/Mercenary
  - Religious/Theological
  - Craft/Guild
  - Mercantile/Trade
  - Industrial/Labor
  - Nationalist/Loyalist
  - Immigrant/Outside/Foreigner  
  - Academic/Arcane
  - "{{unique (tSlice factionTypeTable 0 11) 2}}"

factionGoalTable:
  dice: 1d12
  entries:
    - 1||Hunt/Oppose FACTION
    - 2||Hunt/Oppose CREATURE
    - 3||Spy/Sabotage/Infiltrate
    - 4||Hold territory
    - 5||Expand territory
    - 6||Establish outpost/base
    - 7..8||Locate/Exploit resource
    - 9||Map territory
    - 10..11||Establish/Maintain trade
    - 12||Seek Knowledge/Power/Artifact

factionConditionTable:
  dice: 1d12
  entries:
    - 1..3||Failing/Shrinking
    - 4..5||Nascent/Incipient
    - 6..9||Stable/Sustained
    - 10..11||Successful/Expanding
    - 12||Dominating
`;

const Details = `description: Tables to generate individual details for creatures, places, and things.
source: Freebooters on the Frontier 2nd Edition by Jason Lutes

output: |
  {{setState state 'detailType' (rollTable detailTypeTable)}}
  **{{state.detailType}}:** {{rollTable (lookup @root state.detailType)}}

state:
  detailType: ''

detailTypeTable:
  dice: 1d18
  entries:
    - 1||ABERRANCE
    - 2||ABILITY
    - 3||ACTIVITY
    - 4||ADJECTIVE
    - 5||AGE
    - 6||ALIGNMENT
    - 7||ASPECT
    - 8||COLOR
    - 9||CONDITION
    - 10||DAMAGE_TYPE
    - 11||DESIGN
    - 12||ELEMENT
    - 13||FACTION
    - 14||MAGIC
    - 15||ODDITY
    - 16||ORIENTATION
    - 17||TERRAIN
    - 18||VISIBILITY

ABERRANCE:
  - multicephalous
  - profuse sensory organs
  - anatomical oddity
  - anatomical oddity
  - many limbs/digits
  - acephalous/decentralized
  - tentacles/feelers
  - gibbering/babbling
  - exudes chaos/blight
  - shapechanging
  - "{{rollTable ODDITY}} based"
  - "{{unique (tSlice ABERRANCE 0 11) 2}}"

ABILITY:
  - bless/curse
  - entrap/paralyze
  - levitate/fly/teleport
  - telepathy/mind control
  - mimic/camouflage
  - seduce/hypnotize
  - dissolve/disintegrate
  - "{{rollTable ASPECT}} based"
  - "{{rollTable ELEMENT}}"
  - drain life/drain magic
  - "{{rollTable MAGIC}}"
  - "{{unique (tSlice ABILITY 0 11) 2}}"

ACTIVITY:
  dice: 1d12
  entries:
    - 1||laying trap/ambush
    - 2||fighting/at war
    - 3||prowling/on patrol
    - 4||hunting/foraging
    - 5||eating/resting
    - 6||arguing/infighting
    - 7||traveling/exploring
    - 8||trading/negotiating
    - 9||fleeing/running away
    - 10||building/excavating
    - 11||sleeping/unconscious
    - 12||nursing injury/dying

ADJECTIVE:
  dice: 1d12
  entries:
    - 1||slick/slimy
    - 2||rough/hard/sharp
    - 3||smooth/soft/dull
    - 4||corroded/rusty
    - 5||rotten/decaying
    - 6||broken/brittle
    - 7||stinking/smelly
    - 8||weak/thin/drained
    - 9||strong/fat/full
    - 10||pale/poor/shallow
    - 11||dark/rich/deep
    - 12||colorful

AGE:
  dice: 1d12
  entries:
    - 1||unborn/nascent
    - 2||being born/budding
    - 3||newborn/blossoming
    - 4..6||young/green
    - 7..9||mature/ripe
    - 10||old/going soft
    - 11||dead/withered/ancient
    - 12||dust/pre-historic

ALIGNMENT:
  - evil
  - chaotic
  - chaotic
  - neutral
  - neutral
  - neutral
  - lawful
  - lawful
  - good
  - good
  - "{{pick 'lawful,neutral,chaotic'}} {{pick 'evil,neutral,good'}}"
  - "{{pick 'lawful,neutral,chaotic'}} {{pick 'evil,neutral,good'}}"

ASPECT:
  dice: 1d12
  entries:
    - 1||war/discord
    - 2||hate/envy
    - 3||power/strength
    - 4||trickery/dexterity
    - 5||time/constitution
    - 6||lore/intelligence
    - 7||nature/wisdom
    - 8||culture/charisma
    - 9||luck/fortune
    - 10||love/admiration
    - 11||peace/balance
    - 12||glory/divinity

COLOR:
  dice: 1d12
  entries:
    - 1||white/bright/pale
    - 2||red/pink/maroon
    - 3||orange/peach
    - 4||yellow/mustard/ochre
    - 5||green/chartreuse/sage
    - 6||blue/aquamarine/indigo
    - 7||violet/purple
    - 8||gray/slate
    - 9||brown/beige/tan
    - 10||black/dark
    - 11||metallic/prismatic
    - 12||transparent/clear

CONDITION:
  dice: 1d12
  entries:
    - 1||being built/born
    - 2..4||intact/healthy
    - 5..7||active/alert
    - 8..9||weathered/tired/weak
    - 10||vacant/lost
    - 11||damaged/hurt/dying
    - 12||broken/missing/dead

DAMAGE_TYPE:
  - blunt/bludgeoning
  - blunt/bludgeoning
  - edged/slicing
  - edged/slicing
  - pointed/piercing
  - pointed/piercing
  - constricting/crushing
  - poison/toxic
  - acid/dissolving
  - choking/asphyxiating
  - "{{rollTable ELEMENT}}"
  - "{{unique (tSlice DAMAGE_TYPE 0 11) 2}}"

DESIGN:
  - blank/plain
  - floral/organic
  - circular/curvilinear
  - geometric/triangular
  - asymmetrical
  - square/rectilinear
  - meandering/labyrinthine
  - oceanic/wavelike
  - astrological/cosmic
  - balanced/harmonious
  - erratic/chaotic/random
  - "{{unique (tSlice DESIGN 0 11) 2}}"

ELEMENT:
  dice: 1d12
  entries:
    - 1||void
    - 2||death/darkness
    - 3..4||fire/metal/smoke
    - 5..6||earth/stone/vegetation
    - 7..8||water/ice/mist
    - 9..10||air/wind/storm
    - 11||life/light
    - 12||stars/cosmos

FACTIONTYPE:
  - commoner/peasant
  - criminal/corrupt
  - revolutionary/subversive
  - military/merc/security
  - religious/theological
  - craft/guild
  - trade/mercantile
  - labor/industrial
  - nationalist/loyalist
  - outsider/foreign
  - academic/arcane
  - "{{unique (tSlice FACTION 0 11) 2}}"

MAGIC:
  dice: 1d12
  entries:
    - 1||necromancy
    - 2..3||evocation/destruction
    - 4||conjuration/summoning
    - 5||illusion/glamour
    - 6||enchantment/artifice
    - 7||transformation
    - 8||warding/binding
    - "9..10||{{rollTable ELEMENT}}"
    - 11||restoration/healing
    - 12||divination/scrying

ODDITY:
  - bright/garish/harsh
  - geometric/concentric
  - web/network
  - crystalline/glassy
  - fungal/slimy/moldy
  - gaseous/misty/illusory
  - volcanic/explosive
  - magnetic/repellant
  - multilevel/tiered
  - absurd/impossible
  - "{{unique (tSlice ODDITY 0 10) 2}}"

ORIENTATION:
  dice: 1d12
  entries:
    - 1..2||down/earthward
    - 3||north
    - 4||northeast
    - 5||east
    - 6||southeast
    - 7||south
    - 8||southwest
    - 9||west
    - 10||northwest
    - 11..12||up/skyward

TERRAIN:
  dice: 1d12
  entries:
    - 1||sea/ocean
    - 2||wasteland/desert
    - 3||lowland/plains
    - 4..6||lowland/plains
    - 6||wetland/swamp
    - 7..8||woodland/jungle
    - 9..10||highland/hills
    - 11||mountains
    - "12||{{altRollTable TERRAIN '1d10+1'}} odd: {{rollTable ODDITY}}"

VISIBILITY:
  dice: 1d12
  entries:
    - 1..2||buried/hidden/invisible
    - 3..6||obscured/overgrown
    - 7..9||obvious/in plain sight
    - 10..11||visible at near distance
    - 12||visible at far distance
`;

export default {
  Region: {
    name: "FotF_Region",
    code: Region,
  },
  Creatures: {
    name: "FotF_Creatures",
    code: Creatures,
  },
  RegionFeatures: {
    name: "FotF_RegionFeatures",
    code: RegionFeatures,
  },
  Details: {
    name: "FotF_Details",
    code: Details,
  },
};
