import { html } from "uhtml";
import { TreeBase } from "./treebase";
import { comparators } from "app/data";
import "css/gridfilter.css";
import * as Props from "./props";

export class GridFilter extends TreeBase {
  field = new Props.Field({ hiddenLabel: true });
  operator = new Props.Select(Object.keys(comparators), { hiddenLabel: true });
  value = new Props.Expression("", { hiddenLabel: true });

  /** move my parent instead of me.
   * @param {boolean} up
   */
  moveUpDown(up) {
    this.parent?.moveUpDown(up);
  }

  /** Format the settings
   * @param {GridFilter[]} filters
   * @return {Hole}
   */
  static FilterSettings(filters) {
    if (filters.length === 0) return html`<div />`;
    return html`<div class="filters-block">
      <div class="filters-heading">Filters</div>
      ${filters.map(
        (filter) => html`
          <div class="filter-row" id=${filter.id + "-settings"}>
            ${filter.operator.value.startsWith("only")
              ? html`<span class="filter-field-placeholder"></span>`
              : filter.field.input()}
            ${filter.operator.input()} ${filter.value.input()}
          </div>
        `,
      )}
    </div>`;
  }

  /** Convert from Props to values for data module
   * @param {GridFilter[]} filters
   */
  static toContentFilters(filters) {
    return filters.map((child) => ({
      field: child.field.value,
      operator: child.operator.value,
      value: child.value.value,
    }));
  }
}
TreeBase.register(GridFilter, "GridFilter");
