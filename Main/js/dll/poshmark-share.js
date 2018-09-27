async function Basla() {
    console.log('Shares başlıyor. :)')
    await sleep(2)
    var userPic = $('.user-pic-bck')
    if(userPic.length == 0){
        console.log('Login ol!')
        return
    }
    var shares = $('.share')

    for (let i = 0; i < 8; i++) {
        var share = shares[i]
        share.click()
        await sleep(1)
        var shareToMyFollowers = $('.modal-body a')[0]
        await sleep(1)
        shareToMyFollowers.click()
    }

    await sleep(15)
    window.location.reload()

}

function sleep (saniye) {
    return new Promise(resolve => setTimeout(resolve, saniye * 1000))
}

Basla()
