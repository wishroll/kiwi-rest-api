const routes = async (fastify, options) => {
    fastify.get('/:platform/appstore', (req, res) => {
        return res.redirect('https://testflight.apple.com/join/R1XPKU6Q')
    })
}

module.exports = routes