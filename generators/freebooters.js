const Region = `description: Tables to randomly generate regions for a fantasy setting.
source: Freebooters on the Frontier 2nd Edition by Jason Lutes

output: |
  # {{rollTable regionNameTemplate}}
  {{setState state 'currentClimate' (eval regionClimate null)}}
  {{eval (lookup regionTerrain state.currentClimate)}}, {{state.currentClimate}}, {{rollTable regionSize}}, {{eval regionAlignment.neutral}}

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
  small: "{{roll 1d4}}"
  sizable: "{{roll 2d6}}"
  large: "{{roll 3d8}}"
  expansive: "{{roll 4d10}}"
  vast: "{{roll 5d12}}"

regionClimate: "{{ws 'frigid,temperate,torrid||2,8,2'}}"

regionTerrain:
  frigid: "{{ws 'volcanic highland,mountains|glacier,highland|hills,hilly boreal forest|taiga,tundra|steppe|wasteland,boreal forest|taiga||1,2,2,2,3,2'}}"
  temperate: "{{ws 'volcanic highland,mountains|glacier,mountains,highland|hills,hilly forest,woodland|forest,wasteland|marsh|swamp,lowland|plains|prairie||1,1,1,2,1,3,1,2'}}"
  torrid: "{{ws 'volcanic highland,mountains,highland|hills|dunes,hilly jungle|rainforest,jungle|rainforest,wetland|marsh|swamp,lowland|desert|flats||1,2,2,1,2,1,3'}}"

regionAlignment:
  good: "{{ws 'evil,chaotic,neutral,lawful,good||1,2,2,2,5'}}"
  neutral: "{{ws 'evil,chaotic,neutral,lawful,good||1,2,6,2,1'}}"
  evil: "{{ws 'evil,chaotic,neutral,lawful,good||5,2,2,2,1'}}"
  lawful: "{{ws 'evil,chaotic,neutral,lawful,good||2,1,2,5,2'}}"
  chaotic: "{{ws 'evil,chaotic,neutral,lawful,good||2,6,1,1,2'}}"

regionNamePieces:
  TERRAIN: Bay,Bluffs,Bog,Cliffs,Desert,Downs,Dunes,Expanse,Fells,Fen,Flats,Foothills,Forest,Groves,Heath,Heights,Hills,Hollows,Jungle,Lake,Lowland,March,Marsh,Meadows,Moor,Morass,Mounds,Mountains,Peaks,Plains,Prairie,Quagmire,Range,Reach,Sands,Savanna,Scarps,Sea,Slough,Sound,Steppe,Swamp,Sweep,Teeth,Thicket,Upland,Wall,Waste,Wasteland,Woods
  ADJECTIVE: Ageless,Ashen,Black,Blessed,Blighted,Blue,Broken,Burning,Cold,Cursed,Dark,Dead,Deadly,Deep,Desolate,Diamond,Dim,Dismal,Dun,Eerie,Endless,Fallen,Far,Fell,Flaming,Forgotten,Forsaken,Frozen,Glittering,Golden,Green,Grim,Holy,Impassable,Jagged,Light,Long,Misty,Perilous,Purple,Red,Savage,Shadowy,Shattered,Shifting,Shining,Silver,White,Wicked,Yellow
  NOUN: Ash,Bone,Darkness,Dead,Death,Desolation,Despair,Devil,Doom,Dragon,Fate,Fear,Fire,Fury,Ghost,Giant,God,Gold,Heaven,Hell,Honor,Hope,Horror,King,Life,Light,Lord,Mist,Peril,Queen,Rain,Refuge,Regret,Savior,Shadow,Silver,Skull,Sky,Smoke,Snake,Sorrow,Storm,Sun,Thorn,Thunder,Traitor,Troll,Victory,Witch`;

export default {
  Region: {
    name: "Freeboters_on_the_Frontier_Region",
    code: Region,
  },
};
