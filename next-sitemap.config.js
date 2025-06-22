/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://pakettlyukle.com',
  generateRobotsTxt: true,
  exclude: ['/auth', '/auth/admin'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: 'Googlebot',
        allow: ['/blog', '/operatorler/', '/operatorler/*/', '/'],
        disallow: ['/auth/', '/auth/admin'],
      },
      {
        userAgent: '*',
        allow: ['/blog', '/operatorler/', '/operatorler/*/', '/'],
        disallow: ['/auth/', '/auth/admin'],
      },
    ],
  },
};

