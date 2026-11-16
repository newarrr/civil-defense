// Video links from /admin → embed address of a player that sets no tracking cookies.
// No browser globals here: tools/check.mjs imports the same parser, so staff are warned about
// exactly the links the site cannot play.

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/

/**
 * YouTube or Vimeo page link → { url, host } of the embed player, or null when the link cannot play.
 *   youtube.com/watch?v=<id> · youtu.be/<id> · youtube.com/(shorts|live|embed|v)/<id>
 *   vimeo.com/<id> · vimeo.com/<id>/<hash> (unlisted) · vimeo.com/…/<id>?h=<hash>
 */
export function embedVideo(link) {
  let url
  try {
    url = new URL(String(link || ''))
  } catch {
    return null
  }
  if (url.protocol !== 'https:') return null
  const host = url.hostname.replace(/^(www|m)\./, '')
  const parts = url.pathname.split('/').filter(Boolean)

  if (host === 'youtube.com' || host === 'youtu.be') {
    const id = host === 'youtu.be'
      ? parts[0]
      : url.searchParams.get('v') || (/^(shorts|live|embed|v)$/.test(parts[0]) ? parts[1] : '')
    const ok = YOUTUBE_ID.test(id || '') && !/^(videoseries|live_stream)$/.test(id)
    return ok ? { url: `https://www.youtube-nocookie.com/embed/${id}`, host: 'YouTube' } : null
  }

  if (host === 'vimeo.com') {
    // Only the shapes of a single-video address; collections (showcase, album, event, a channel
    // or group page) are refused, so staff are warned instead of the site showing the wrong video.
    const path = parts.join('/')
    let id = ''
    let hash = url.searchParams.get('h') || ''
    if (/^\d+(\/[0-9a-f]+)?$/i.test(path)) [id, hash = hash] = parts           // vimeo.com/<id>[/<unlisted hash>]
    else if (/^channels\/[^/]+\/\d+$/.test(path)) id = parts[2]               // channels/<name>/<id>
    else if (/^groups\/[^/]+\/videos\/\d+$/.test(path)) id = parts[3]         // groups/<name>/videos/<id>
    else if (/^(showcase|album)\/\d+\/video\/\d+$/.test(path)) id = parts[3]  // showcase/<n>/video/<id>
    else if (/^(manage\/videos|video)\/\d+$/.test(path)) id = parts.at(-1)    // video/<id>, manage/videos/<id>
    if (!id) return null
    const query = new URLSearchParams({ ...(/^[0-9a-f]+$/i.test(hash) ? { h: hash } : {}), dnt: '1' })
    return { url: `https://player.vimeo.com/video/${id}?${query}`, host: 'Vimeo' }
  }
  return null
}
