function getHexCodeForScore(score) {
    switch (true) {
        case (score < 0.45):
            return '#EA1D3B'
        case (score < 0.65):
            return '#EA7F1D'
        case (score < 100):
            return '#EAD51D'
        default:
            break;
    }
}
module.exports = {getHexCodeForScore}