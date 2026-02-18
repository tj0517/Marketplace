import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/admin/', '/manage/', '/payment/'],
        },
        sitemap: 'https://lekcjo.pl/sitemap.xml',
    }
}
