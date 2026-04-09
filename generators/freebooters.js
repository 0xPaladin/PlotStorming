const Region = `description: Tables to randomly generate regions for a fantasy setting.
source: Freebooters on the Frontier 2nd Edition by Jason Lutes

output: |
  ## {{rollTable regionNameTemplate}}
  {{setState state 'currentClimate' (ws regionClimate)}}
  {{ws (lookup regionTerrain state.currentClimate)}}, {{state.currentClimate}}, {{rollTable regionSize}}, {{ws regionAlignment.neutral}}

state:
  currentClimate: temperate

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

output: {{lookup @root (ws creatureType)}}

creatureType: monster,unusual,beast,humanoid||2,4,2,5

# ============================================================================
# CREATURE TYPES
# ============================================================================

monster: {{ws (lookup monsterTypes (ws monsterType))}}

monsterType: extraplanarFoe,legendaryMonster,undead||2,5,3   

monsterTypes:
  extraplanarFoe: divine|demonic lord,angel|demon,cherub|imp,elemental (ELEMENT)||1,1,1,1,4
  legendaryMonster: huge oddity,dragon|giant + BEAST,dragon|giant,BEAST + huge||1,1,1,5
  undead: lich|vampire|mummy,wight|wraith,wisp|ghost|specter,skeleton|zombie|ghoul||1,1,2,4

unusual: {{ws (lookup unusualTypes (ws unusualType))}}

unusualType: slime,beastly,wildHumanoid||2,4,4

unusualTypes: 
  slime: slime|ooze|jelly,plant|fungus|parasite,golem|homunculus,fey|fairy||3,3,1,1
  beastly: BEAST + ABERRANCE,BEAST + ELEMENT,BEAST + ODDITY,BEAST + ABILITY,BEAST + BEAST||1,1,1,2,3
  wildHumanoid: ogre|troll,orc|hobgoblin|gnoll,goblin|kobold,HUMANOID + ODDITY,HUMANOID + BEAST||1,2,3,1,1

beast: {{pick (lookup beastTypes (ws beastType))}}

beastType: waterGoing,airborne,earthbound||2,3,5

beastTypes:
  waterGoing: 
    - whale/narwhal
    - squid/octopus
    - dolphin/shark/alligator
    - turtle/clam/snail/crab
    - fish/eel/snake,frog/toad
    - jelly/anemone
    - insect/barnacle
  airborne: 
    - pteranadon/condor
    - eagle/owl/hawk/falcon
    - heron/crane/ostrich
    - crow/raven/gull
    - songbird/parrot
    - chicken/duck/goose
    - bee/wasp/hornet/locust
    - butterfly/moth/mosquito
  earthbound: 
    - dinosaur/elephant
    - ox/rhino/bear/apex
    - deer/horse/camel
    - panther/wolf/boar
    - snake/lizard/armadillo
    - mouse/rat/weasel/cat
    - ant/centipede/scorpion
    - slug/worm/tick/beetle

humanoid: {{ws (lookup humanoidTypes (ws humanoidType))}}

humanoidType: rare,uncommon,common||1,3,5

humanoidTypes: 
  rare: elf (medium)||1
  uncommon: dwarf (small),halfling (small)||3,5
  common: mixed group,human (medium)||2,6
`

const RegionFeatures = `
description: Tables to randomly generate features for a fantasy setting.
source: Freebooters on the Frontier 2nd Edition by Jason Lutes

import:
  - FotF_Creatures

output: {{lookup @root (rollTable featureType)}}

featureType:
  roll: 1d12
  entries:
    - 1..4||creature
    - 3..4||hazard
    - 5..6||obstacle
    - 7..8||area
    - 9..10||namedPlace
    - 11||site
    - 12||factionPresence
    - 12..99||settlement

creature: {{FotF_Creatures.output}}

hazard: 

hazardType: u|n||1,11
hazardTypes: 
  u:
  n: 

obstacle:

area:

namedPlace:

site:

factionPresence

settlement
`

export default {
  Region: {
    name: "FotF_Region",
    code: Region,
  },
};
