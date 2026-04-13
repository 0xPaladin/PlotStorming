import handlebars from "https://cdn.jsdelivr.net/npm/handlebars@4.7.9/+esm";
import { parse, stringify } from "https://cdn.jsdelivr.net/npm/yaml@2.8.3/+esm";
import chance from "https://cdn.jsdelivr.net/npm/chance@1.1.13/+esm";

const RNG = new chance(Date.now());

/*
  Hanlebars Helpers
*/
//set state
handlebars.registerHelper("setState", function (state, key, val) {
  state[key] = val;
});

//weighted string
handlebars.registerHelper("ws", function (str) {
  const [values, weights] = str.split("||");
  let res = RNG.weighted(values.split(","), weights.split(",").map(Number));
  //check for nested via /
  if (res.includes("|")) {
    res = RNG.pickone(res.split("|"));
  }

  return res;
});

const RollTable = (table, altDie = null) => {
  //if no dice push to Pick
  if (!table.dice) {
    return Pick(table);
  }

  const { dice, entries } = table;
  //roll dice
  const roll = diceRoll(altDie || dice);
  //find entry
  const entry = entries.find((e) => {
    const [range] = e.split("||");
    //check for range
    if (range.includes("..")) {
      const [min, max] = range.split("..").map(Number);
      return roll >= min && roll <= max;
    } else {
      return roll === Number(range);
    }
  });
  //return value
  const [range, value] = entry.split("||");
  return value;
};

//roll from table given table object
handlebars.registerHelper("altRollTable", function (table, altDie = null) {
  return RollTable(table, altDie);
});

//roll from table given table object
handlebars.registerHelper("rollTable", function (table) {
  return RollTable(table);
});

//pick unique N from array
handlebars.registerHelper("unique", function (toPick, n) {
  const arr =
    typeof toPick === "string"
      ? toPick.split(",").map((str) => str.trim())
      : toPick;

  //have to remove duplicates in the array first
  return RNG.shuffle([...new Set(arr)]).slice(0, Number(n));
});

//pick n from array
handlebars.registerHelper("pickN", function (toPick, n) {
  return Array.from({ length: Number(n) }, () =>
    Pick(
      typeof toPick === "string"
        ? toPick.split(",").map((str) => str.trim())
        : toPick,
    ),
  );
});

//split string and pick
handlebars.registerHelper("slashSplit", function (toPick) {
  const arr = toPick.split("/");
  return Pick(arr);
});

//pick from array
handlebars.registerHelper("pick", function (toPick) {
  return Pick(
    typeof toPick === "string"
      ? toPick.split(",").map((str) => str.trim())
      : toPick,
  );
});

//slice array
handlebars.registerHelper("tSlice", function (arr, start, end) {
  return (
    typeof arr === "string" ? arr.split(",").map((str) => str.trim()) : arr
  ).slice(Number(start), Number(end));
});

//roll dice
handlebars.registerHelper("roll", function (dice) {
  return diceRoll(dice);
});

//evaluate recursive
handlebars.registerHelper("eval", function (str, data) {
  const template = handlebars.compile(str);
  return template(data);
});

//equality check
handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});

//loop
handlebars.registerHelper("loop", function (n, what) {
  //console.log(what, context.data.root);
  var ret = "";
  for (var i = 0; i < n; ++i) ret += `\n- ${what}`;
  return ret;
});

//roll dice
const diceRoll = (str) => {
  //check for bonus
  const [dice, bonus] = str.split("+");
  //roll dice
  const roll = RNG.rpg(dice, { sum: true });
  //add bonus
  return bonus ? roll + Number(bonus) : roll;
};

//pick from array
const Pick = (data) => {
  //check for array
  if (!Array.isArray(data)) {
    return data;
  }

  //check if weighted array
  if (data[0].includes("||")) {
    //check for weights
    const [weights, values] = data.reduce(
      (acc, d) => {
        const [weight, value] = d.split("||");
        acc[0].push(Number(weight));
        acc[1].push(value);
        return acc;
      },
      [[], []],
    );
    //pick weighted
    return RNG.weighted(values, weights);
  } else {
    //pick random
    return RNG.pickone(data);
  }
};

//regex to find ids from all {{}}
const regex = /\{\{(.*?)\}\}/g;
const getDataIds = (str) => Array.from(str.matchAll(regex), (m) => m[1]);

//import all generators
import { default as GENERATORS } from "../generators/index.js";

export class GeneratorManager {
  constructor(app) {
    this.app = app;
  }

  init() {
    //check if generators exist - if not add to content manager
    const CM = this.app.ContentManager;
    Object.values(GENERATORS).forEach((g) => {
      if (!CM.all.find((c) => c.name === g.name)) {
        CM.add({ folder: "generators", name: g.name, text: g.code });
      }
    });
  }

  getImports(toImport) {
    const CM = this.app.ContentManager;
    //structure for imports
    const imported = [];
    const parsed = {};
    //loop until no more nested imports
    while (toImport.length > 0) {
      toImport.forEach((name) => {
        imported.push(name);
        //get content
        const content = CM.all.find((c) => c.name === name);
        //parse
        parsed[name] = parse(content.text);
        //check for nested imports
        (parsed[name].import || [])
          .filter((i) => !toImport.concat(imported).includes(i))
          .forEach((i) => toImport.push(i));
        //remove from toImport
        toImport = toImport.filter((i) => !imported.includes(i));
      });
    }

    //create a compiled data object, set every "output" to name_output
    const compiled = {};
    Object.entries(parsed).forEach(([name, data]) => {
      //loop through data and add direct values to compiled
      Object.entries(data).forEach(([key, value]) => {
        key === "output"
          ? (compiled[`${name}_output`] = value)
          : (compiled[key] = value);
      });
    });

    //reutrn compiled
    return compiled;
  }

  evaluate(content) {
    try {
      const parsed = parse(content.text);
      //check for imports
      const imports = parsed.import ? this.getImports(parsed.import) : [];
      //build data object
      const data = { ...parsed, ...imports };

      //pick output if array
      const output = Pick(parsed.output);
      //check for handlebars templates
      let final = output;
      //loop until no more templates
      while (final.includes("{{")) {
        //compile template
        const template = handlebars.compile(final)(data);
        //render
        final = Pick(template);
        //console.log(final);
      }

      return final;
    } catch (e) {
      this.app.notify({
        title: "Error",
        message: e.toString(),
        color: "red",
      });
    }
  }

  render(content) {
    const { html, ContentManager } = this.app;
    const { id, text } = content;
    const generatorResult = this.app.state.selected.get("generatorResult");

    return html`
      <div class="relative" style="flex:1;overflow-y: auto;">
        <span
          class="pointer dim bg-light-gray ba br2 b--black pa2 f4 absolute top-0 right-0"
          onClick=${() =>
            this.app.setSelected("generatorResult", this.evaluate(content))}
          >▶︎</span
        >
        <textarea
          class="w-100 h-100"
          value=${text}
          onInput=${(e) => ContentManager.update(id, "text", e.target.value)}
        >
        </textarea>
      </div>
      <div
        class="${generatorResult ? "mt2 pa2" : "dn"}"
        style="flex:1;overflow-y: auto;"
      >
        <div class="b i">Result</div>
        <div id="generatorResult" class="markdown ph2">${generatorResult}</div>
      </div>
    `;
  }
}
