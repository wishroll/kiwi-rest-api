const routes = async (fastify, options) => {
    fastify.get('/:platform/appstore', (req, res) => {
        return res.redirect('https://apps.apple.com/us/app/kiwi-live-music-recs-widget/id1614352817')
    })
}

module.exports = routes