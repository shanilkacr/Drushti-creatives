/** Shared scroll timing for the OurClients → AboutUs curtain transition.
 *
 *  All progress values are 0→1 through the AboutUs scroll track
 *  (start start → end end). Edit CLIENT_FADE_START / CLIENT_FADE_END
 *  directly to control when OurClients content fades out. */

/** Total scroll track height for the AboutUs pinned section (vh). */
export const ABOUT_SCROLL_VH = 220;

/** Same, but for mobile — kept short enough that the title finishes
 *  appearing within roughly one scroll gesture and then holds until the
 *  next scroll carries the user into the following section, rather than
 *  requiring several scrolls the way the (much taller) desktop track does. */
export const ABOUT_SCROLL_VH_MOBILE = 130;

/** Scroll progress where the curtain shape fully closes. */
export const SHAPE_CLOSED_AT = 0.4;

/** Scroll progress where OurClients content begins fading out. */
export const CLIENT_FADE_START = SHAPE_CLOSED_AT * 0.25;

/** Scroll progress where OurClients content is fully faded out. */
export const CLIENT_FADE_END = SHAPE_CLOSED_AT * 0.5;
