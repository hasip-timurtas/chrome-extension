_dur = false
_durSayaci = 1
_cokIstek = false
async function Basla() {
    console.log('Shares başlıyor. :)')
    
    var hata = $( ".error-image-wrapper" ).length
    if(hata > 0){
        console.log('Hata var')
        await sleep(1)
        window.location.reload()
    }

    await sleep(2)

    var userPic = $('.user-pic-bck')
    if(userPic.length == 0){
        console.log('Login ol!')
        return
    }
    
    var shares = $('.share')
    var sayac = 1
    for (const share of shares) {
        if(sayac == 30) break // 30 tanede çık git.
        var postId = share.getAttribute('data-pa-attr-listing_id')
        await Share(postId)
        await sleep(1)
        sayac++
    }

    if(_dur){
        await manuelTikla()
        await sleep(150)
        window.location.reload()
    }else if(_cokIstek){
        console.log('Çok istek var yarım saat bekle.')
        await sleep(60 * 30) // too many request için yarım saat bekle.
    }else{
        await sleep(30)
        window.location.reload()
    }
}

async function manuelTikla(){
    console.log('manuel tıkla.')
    $('.share')[0].click()
    await sleep(1)
    $('.modal-body a')[0].click()
}

async function Share(postId){
    //5b04e54f5521be08c980045c
    if(_dur || _cokIstek) return

    var link = `https://poshmark.com/listing/share?post_id=${postId}`
    await fetch(link, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-agent': 'your bot 0.1'
        },
      })
      .then(response => {
        if (!response.ok) {
            if(response.status == 403){ // google catpcha
                _durSayaci++
                if(_durSayaci > 15){
                    _dur = true
                }
            }else if(response.status == 429){ // too many request
                _cokIstek = true
            }
           
        }
        return response;
      })
      .catch(e=> console.log(e))
}


function sleep (saniye) {
    return new Promise(resolve => setTimeout(resolve, saniye * 1000))
}

Basla()


////////////// ################## TEST ############################# TEST #############################
async function Deneme(){
    await fetch(`https://poshmark.com/listing/share?post_id=5a90a665fcdc31631e2f4bae`, {
        method: 'POST',
        headers: {
		'User-agent': 'your bot 0.1',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (!response.ok) {
            console.log('Hasip', response.statusText);
        }
        return response;
    })
    .catch(e=> console.log(e))
}