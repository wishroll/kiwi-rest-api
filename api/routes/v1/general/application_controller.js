const routes = async (fastify, options) => {
    fastify.get('/:platform/appstore', (req, res) => {
        return res.redirect('https://apps.apple.com/us/app/kiwi/')
    })
}

module.exports = routes