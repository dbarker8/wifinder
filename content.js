let keywords = ['wifi', 'internet']; // add words here

var getReviewsURL = function(info){
  let { key, offset, limit, listing_id } = info;
  let url = 'https://www.airbnb.com/api/v2/reviews'
  + '?currency=USD'
  + '&key='+key 
  + '&locale=en' 
  + '&listing_id='+listing_id 
  + '&role=guest' 
  + '&_format=for_p3' 
  + '&_limit='+limit 
  + '&_offset='+offset 
  + '&_order=language_country';
  return url;
}

//insert HTML and CSS with these strings because simpler than importing files in the extension
$($.parseHTML(`<div id="wifinder-wrapper"><div id='wifinder-inside'></div></div>`)).appendTo('body');
$('head').append('<style type="text/css">#wifinder-wrapper{z-index:9999;background-color:rgba(0,0,0,.5);position:fixed;top:0px;left:0px;right:0px;bottom:0px;display:none;}#wifinder-inside{background-color:white;height:500px;width:600px;padding:30px;border-radius:4px;margin:auto;white-space:pre-wrap;overflow:auto;margin-top: 20px;}</style>');
$('#wifinder-wrapper').click(function(){
  $('#wifinder-wrapper').css("display", "none");
})

//select elements, determine if listing even offers wifi
var wifiElement = $("#amenities > div > div > div > div > section > div._2h22gn > div:nth-child(1) > div:nth-child(2) > table > tbody > tr");
var wifiText = $("#amenities > div > div > div > div > section > div._2h22gn > div:nth-child(1) > div:nth-child(2) > table > tbody > tr > td._4xosax > div");
let wifi = false;
if(wifiElement) if(wifiElement.text().toLowerCase()==='wifi') wifi = true;

// supoorts up to 600 reviews. not best method but it works for this purpose
let getReviews = async function(key, listing_id){
  let reviews = [];
  let resArray = [];

  let reviews1 = await fetch(getReviewsURL({
    key,
    offset: '0',
    limit: '100',
    listing_id: listing_id
  })).then(msgRes => msgRes.json())
  resArray.push(reviews1);
  let reviews_count = reviews1.metadata.reviews_count;

  if(reviews_count>100){
    let reviews2 = await fetch(getReviewsURL({
      key,
      offset: '100',
      limit: '100',
      listing_id: listing_id
    })).then(msgRes2 => msgRes2.json())
    resArray.push(reviews2);
  }

  if(reviews_count>200){
    let reviews2 = await fetch(getReviewsURL({
      key,
      offset: '200',
      limit: '100',
      listing_id: listing_id
    })).then(msgRes2 => msgRes2.json())
    resArray.push(reviews2);
  }

  if(reviews_count>300){
    let reviews2 = await fetch(getReviewsURL({
      key,
      offset: '300',
      limit: '100',
      listing_id: listing_id
    })).then(msgRes2 => msgRes2.json())
    resArray.push(reviews2);
  }

  if(reviews_count>400){
    let reviews2 = await fetch(getReviewsURL({
      key,
      offset: '400',
      limit: '100',
      listing_id: listing_id
    })).then(msgRes2 => msgRes2.json())
    resArray.push(reviews2);
  }

  if(reviews_count>500){
    let reviews2 = await fetch(getReviewsURL({
      key,
      offset: '500',
      limit: '100',
      listing_id: listing_id
    })).then(msgRes2 => msgRes2.json())
    resArray.push(reviews2);
  }

  if(reviews_count>600){
    let reviews2 = await fetch(getReviewsURL({
      key,
      offset: '600',
      limit: '100',
      listing_id: listing_id
    })).then(msgRes2 => msgRes2.json())
    resArray.push(reviews2);
  }

  resArray.forEach(res => {
    keywords = keywords.map(item => item.toLowerCase().trim());
    keywords.forEach(keyword => {
      res.reviews.forEach(review => {
        let msgText  = review.comments.toLowerCase();
        if(msgText.includes(keyword)) reviews.push(review);
      })
    })
  })

  return reviews;
}

// return key from localstorage, or get from API if expired
let getkey = function(){
  return new Promise(resolve => {
    let storedKey = null;
    let isKeyValid = false;
    let keyres = localStorage.getItem('airbnbkey');
    if(keyres){
      keyres = JSON.parse(keyres);
      // locally cache key
      let oldestDate = new Date().setHours(new Date().getHours()-12); // guessing 12 hrs is good...
      storedKey = keyres.key;
      if(new Date(keyres.date) > oldestDate) isKeyValid = true;
    }

    if(isKeyValid){ return resolve(storedKey) }
    else {
      fetch('https://vy1fbiczn2.execute-api.us-east-1.amazonaws.com/latest/getkey')
      .then(result => result.json())
      .then(result => {
        if(!result.key) return resolve(storedKey); // server error, default to something from localstorage even if expired
        localStorage.setItem('airbnbkey', JSON.stringify({
          date: Date.now(),
          key: result.key
        }));
        resolve(result.key);
      }).catch(err => console.log('ERR ', err))
    }
  })
};

let getReviewText = function(reviews){
  let text = '';
  reviews.forEach(item => {
    text = text+'\n__________\n\n'+item.localized_date+'\n'+item.comments;
  })
  text = text.toLowerCase();
  keywords.forEach(keyword => {
    let rgx = new RegExp(keyword,"g");
    text = text.replace(rgx, '<strong>'+keyword+'</strong>');
  })
  return text;
}

// get listing_id from URL and parse to int
let page_url = window.location.href;
let last = page_url.split('/rooms/')[1];
let listing_id = '';
if(last.indexOf('?')>-1) listing_id = last.split('?')[0]; // take everyting before ? mark
if(listing_id.indexOf('/')>-1) listing_id = listing_id.splice(listing_id.indexOf('/'),1); // remove a slash if its there


// Initiate 
let go = function(){
  getkey().then(key => {
    getReviews(key, listing_id).then(reviews => {
      wifiText.text(`Wifi ${"("+reviews.length+")"}`);
  
      if(wifi && reviews.length>0){
        wifiElement.css({
          cursor: "pointer",
          color: '#fd5c63',
        })
        wifiElement.click(function(){
          let text = getReviewText(reviews);
          // show modal here
          $('#wifinder-wrapper').css("display", "block");
          document.getElementById('wifinder-inside').innerHTML=text;
        })
      }
    })
  })
}

go();
