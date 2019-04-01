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

$($.parseHTML(`<div id="wifinder-wrapper"><div id='wifinder-inside'></div></div>`)).appendTo('body');
$('head').append('<style type="text/css">#wifinder-wrapper{z-index:9999;background-color:rgba(0,0,0,.5);position:fixed;top:0px;left:0px;right:0px;bottom:0px;display:none;}#wifinder-inside{background-color:white;height:500px;width:600px;padding:30px;border-radius:4px;margin:auto;white-space:pre-wrap;overflow:auto;margin-top: 20px;}</style>');
$('#wifinder-wrapper').click(function(){
  $('#wifinder-wrapper').css("display", "none");
})

// get listing_id from URL and parse to int
let page_url = window.location.href;
let last = page_url.split('/rooms/')[1];
let listing_id = '';
if(last.indexOf('?')>-1) listing_id = last.split('?')[0]; // take everyting before ? mark
if(listing_id.indexOf('/')>-1) listing_id = listing_id.splice(listing_id.indexOf('/'),1); // remove a slash if its there

//select elements, determine if listing even offers wifi
var wifiElement = $("#amenities > div > div > div > div > section > div._2h22gn > div:nth-child(1) > div:nth-child(2) > table > tbody > tr");
var wifiText = $("#amenities > div > div > div > div > section > div._2h22gn > div:nth-child(1) > div:nth-child(2) > table > tbody > tr > td._4xosax > div");
let wifi = false;
if(wifiElement) if(wifiElement.text().toLowerCase()==='wifi') wifi = true;

const api_url = ' https://5919f432.ngrok.io/getkey';
let reviews = [];

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
    let keywords = ['wifi', 'internet'];
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

fetch(api_url, {
  method: 'GET',
})
.then(result => result.json())
.then(result => {

  getReviews(result.key, listing_id).then(reviews => {
    wifiText.text(`Wifi ${"("+reviews.length+")"}`);

    if(wifi && reviews.length>0){
      wifiElement.css({
        cursor: "pointer",
        color: '#fd5c63',
      })
      wifiElement.click(function(){
        let text = '';
        reviews.forEach(item => {
          text = text+'\n__________\n\n'+item.localized_date+'\n'+item.comments;
        })
        text = text.toLowerCase();
        text = text.replace(/wifi/g, '<strong>wifi</strong>');
        text = text.replace(/internet/g, '<strong>internet</strong>');
        // show modal here
        $('#wifinder-wrapper').css("display", "block");
        document.getElementById('wifinder-inside').innerHTML=text;

      })
    }
  })


})

// fetch('https://www.airbnb.com')
// .then(result => result.text())
// .then(result => {
//   let data = $($.parseHTML(result)).filter('meta');
//   let key = null;
//   // let data = $('#_bootstrap-layout-init').attr('content');
//   // if(data){
//   //   data = JSON.parse(data);
//   //   key = data.api_config.key;
//   // }
//   console.log('aadata ', data)
// })


