# Health & Risk Experience Updates

## General Guidance

- Always try and use /core-react components first, then fall back to build something next new
- Create consistency whenever possible, we are building a system
- When making data changes or changes to the configuration experience, make sure to update connected areas that could have downstream effects

## 1 — Health & Risk Settings Pg - Risk Types

- In order to help users understand the core concepts, create a set of connected onboarding modals to help users understand the core concept of the Health & Risk framework, how they related to each other, and how they can add their business use cases to the framework.
  - Add an affordance in the pageHeader to view the onboarding modal whenever a user wants
- The Linked KPIs cells should be a text-link (text-underline + bold) and on hover, show a PopOver with the list linked KPIs
- Set a max-width of 300px on the Description column. Text should wrap to two lines and truncate

---

## 2 - Edit Risk Type tearsheet

- Fix the formatting on the checkbox group columns (Source Data, Linked KPIs and Default Response Strategies) so that the columns are along in a standard grid. There are some weird spacing happening, especially on the left column between the first and second checkboxes

---

## 3 — Health & Risk Settings Pg - KPIs

- Add the ability to change the Calc Type inline in the table
- Add an info icon in the table header with a tooltip that describes what each column does
- Change the input fields for both Yellow at, Red at, and Weight cells to be the standard input border color

---

## 4 - Create Custom KPI tearsheet

- Update the stepper experience to match the layout + styling already implemented on the Procore Connect tab in the Project Details tearsheet
- Once you do that, update both to use the --color-action-primary) as the bg-color and border-color for the active and complete steps instead of the orange
- Fix the styling on Step 3 (Filters), layout, text, form elements are styled wrong and need to user /core-react components. Look at other examples in the app for styling. Same for Step 4 (Thresholds)
- Make sure the KPI creation works and updates the KPIs table and makes them available in list of KPIs to pull into the Risk Scorecard. If you need to, use local Storage.

---

## 5 - Health & Risk Settings Pg - Scope

- The info banner should display below the description text (Choose which projects are included in the portfolio health score. By default, all active projects are included.)
- Remove Include on-hold projects option
- Add any other scope configurations that make sense based on the brief

---

## 6 — Project Details - Health tab

- Change the critical button call out at the top and replace with a Banner component from /core-react. There are three options, error (red) for critical, attention (yellow) for at risk, and info (blue) for healthy.
- For each banner, call out the status (Critical, At Risk, and Healthy) and include a short summary of health for each.
- Remove → Stable, not sure what that means.
- Change the tags (e.g. Budget module) and update to Pill component and use the gray one (Draft)

---

## 7 — Risk Scorecard (KPI card)

- Add an Account Settings tertiary button to the empty state that takes users directly to the Health & Risk account settings

---

## 8 — KPI Details tearsheet

- Make sure these tearsheets are 60% width to match all the other ones

---

## 9 — Health & Risk Hub View Cards

- Row 1 should have the risk scorecard
- Row 2 should have 2 cards, first is card with a list of the top 5 projects sorted by highest risk. Follow the hub card framework and use the HubCardTable (lightweight custom HTML table). Second should be a portfolio risk gauge, using a gauge visualization to measure the overall risk of the portfolio of active project. For each, find ways to open up drill-in views in a tearsheet, like the interactive pattern we have established.
- Row 3 should be a AG Grid (SmartGridWrapper) card wrapped in a hub card component that focuses on showing all projects, but presenting all the KPI data in the columns. Make sure to add the action bar with search, filters, grouping, and configure columns, just like the Portfolio table card.

---


## Schedule Risk Fixes
- Schedule Risk card - When clicking on the KPIs at the top to open the tearsheet, each tearsheet list should reflect the number of items. For example, On Schedule says 3 of 10, so the tearsheet should only show 3 project.
- Schedule Risk card - Make sure the KPIs are calculated based on the entire portfolio of active projects, not just a subset.
- Schedule Heatmap table card — Look at the tooltips for each cell and make sure the "actual" date is showing in the tooltip.
- Schedule Heatmap tearsheet — Both Start & Completion Dates + Project Milestones are unique sections and should be wrapped in a card component. Use the /core-react input components for the editable date fields.
- On the Project Dates card on the project overview, when you configure the dates in the configure modal, include a required notes input when users update the “actual date”. If already updated, show the notes in the modal. Also add the notes to the tooltip for any milestone that has them. Do this for every project and make sure the data matches the project.
- Also, if you haven’t already done so, update he data model for project milestones to include the require notes field when an actual date is added.