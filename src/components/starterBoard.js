/**
 * What a brand-new board starts with, so a student can build from scratch
 * without first learning layouts and actions: a message bar with a Clear
 * button, an empty grid to type words into, and the actions that make
 * tapping work (a word is spoken and added to the message; tapping the
 * message speaks it all; Clear empties it).
 *
 * Same shape and names as the boards "Generate with AI" builds
 * (content.js), so generating over a new board replaces it cleanly.
 */

export const starterLayout = {
  className: "Layout",
  // text big enough to read on a tablet; the whole board scales from this
  props: { name: "Layout", uiScale: "1.6" },
  children: [
    {
      className: "Page",
      props: {},
      children: [
        {
          className: "Stack",
          props: { direction: "row", background: "", scale: "1" },
          children: [
            {
              className: "Display",
              props: {
                stateName: "$Display",
                Name: "display",
                background: "white",
                fontSize: "2",
                scale: "5",
              },
              children: [],
            },
            {
              className: "Button",
              props: {
                label: "Clear",
                name: "clear",
                background: "",
                scale: "1",
              },
              children: [],
            },
          ],
        },
        {
          className: "Grid",
          props: {
            name: "grid",
            rows: "3",
            columns: "4",
            fillItems: "true",
            background: "white",
            scale: "5",
          },
          children: [],
        },
        { className: "Speech", props: { stateName: "$Speak" }, children: [] },
      ],
    },
  ],
};

/** @param {string} origin @param {string} condition @param {[string, string][]} updates */
function rule(origin, condition, updates) {
  return {
    className: "Action",
    props: { origin },
    children: [
      {
        className: "ActionCondition",
        props: { Condition: condition },
        children: [],
      },
      ...updates.map(([stateName, newValue]) => ({
        className: "ActionUpdate",
        props: { stateName, newValue },
        children: [],
      })),
    ],
  };
}

export const starterActions = {
  className: "Actions",
  props: {},
  children: [
    rule("grid", "", [
      ["$Speak", "#label"],
      ["$Display", "add_word(#label)"],
    ]),
    rule("display", "$Display", [["$Speak", "$Display"]]),
    rule("clear", "", [["$Display", "''"]]),
  ],
};
