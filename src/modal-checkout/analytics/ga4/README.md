# Newspack Modal Checkout Google Analytics Tracking

The Newspack Modal Checkout uses <a href="https://github.com/Automattic/newspack-plugin/blob/trunk/includes/data-events/README.md">Newspack Data Events</a> to help track information for Google Analytics 4.

## Actions

Each sequence will include the following actions:

| `action`                   | When it's used                                                                                                     |
| ---------------------------| ------------------------------------------------------------------------------------------------------------------ |
| `opened`                   | When the modal checkout is opened, either from the Donate Block, Checkout Button Block, or Variation picker screen |
| `opened_variations`        | When a variation picker is opened from a Checkout button block                                                     |
| `loaded`                   | When the modal finishes loading                                                                                    |
| `continue`                 | When the 'Continue' button is clicked                                                                              |
|`back`                      | When the 'Back' button is clicked                                                                                  |
|`dismissed`                 | When the modal is closed before completion                                                                         |
|`form_submission`           | When a submission attempt is made                                                                                  |
|`form_submission_success`   | When a submission attempt is completed (back-end event)

## Action Types

The action types used are:

| `action_type`     | When it's used      |
| ------------- | ------------- |
| `checkout_button` | When the modal trigger is the Checkout Button block |
| `donation`       | When the modal trigger is the Donation block |

## What's captured

We're capturing the following information on most steps:

| What's captured     | When it's captured      |
| -------------------- | --------------------- |
| `amount` | For each step, except when opening a variation picker since the price isn't known |
| `currency` | For each step |
| `is_variable` | Only the initial `open_variations` step when opening a variation picker |
| `product_id` | For each step |
| `product_type`*** | For each step |
| `recurrence` | For each step, except when opening a variation picker for a variable subscription product |
| `referer` | For each step |
| `variation_id` | For steps after picking a product variation |

*** The product types have yet to be finalized, but currently are: `product`, `subscription`, `membership`, and `donation`.