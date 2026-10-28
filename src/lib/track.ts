// Tracking hook points. Meta Pixel code lives elsewhere (separate work);
// this file is the single place to wire it in. Each call site also has a
// matching data-track="<event>" attribute on the element.

export type DemoEvent =
  | 'view'          // page view (app mounted)
  | 'exam_start'    // test opened: start / resume tapped
  | 'exam_submit'   // submit confirmed or time ran out
  | 'result_view'   // result screen shown
  | 'review_open'   // "review answers" tapped
  | 'signup_start'; // any signup button tapped, before leaving the page

export function track(event: DemoEvent, data?: Record<string, unknown>) {
  // TODO(pixel): call the tracking helpers once they exist, e.g.
  //   view         → PageView (+ trackViewContent() for the demo)
  //   exam_start   → trackViewContent({ content_name: data.demoId })
  //   signup_start → trackLead() / InitiateCheckout-style event
  // Load the Pixel script after page load, not in <head> (it's ~90 KB).
  if (import.meta.env.DEV) console.debug('[track]', event, data ?? '');
}
