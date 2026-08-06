const ADMIN_ORIGIN = (Netlify.env.get('VITE_ADMIN_ORIGIN') || 'https://fabulous-stroopwafel-560888.netlify.app').replace(/\/$/, '')

export default async (request, context) => {
  const url = new URL(request.url)
  const adminHost = new URL(ADMIN_ORIGIN).hostname

  if (url.hostname !== adminHost) {
    return Response.redirect(`${ADMIN_ORIGIN}${url.pathname}${url.search}`, 302)
  }

  return context.next()
}
