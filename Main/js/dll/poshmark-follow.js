async function FollowUser(userId){
    var postId = `https://poshmark.com/user/${userId}/follow_user`
    await fetch(postId, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
      });
}

async function Basla(){
    // login kontrol
    console.log('Shares başlıyor. :)')
    await sleep(2)
    var userPic = $('.user-pic-bck')
    if(userPic.length == 0){
        console.log('Login ol!')
        return
    }

    var nofitications = $('.content')

    var followers = nofitications.filter(function( index ) {
        return $( this ).text().includes('following')
      });
    
    followers.each(async function( index ) {
        var description = $( this ).text()
        var userId = $( this ).parent().parent().attr('actor_id')
        console.log(userId, description)
        await FollowUser(userId)
        await sleep(2)
        console.log(userId, ' takip edildi')
    });

    await sleep(15)
    window.location.reload()
}

function sleep (saniye) {
    return new Promise(resolve => setTimeout(resolve, saniye * 1000))
}


Basla()