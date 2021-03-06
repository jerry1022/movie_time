var async = require('async'),
  needle = require('needle'),
  cheerio = require('cheerio'),
  schedule = require('node-schedule'),
  CONSTANT = require('./theaterHash'),
  MovieTimeModel = require('../models/movieTimeModel'),
  movieTimeModel = new MovieTimeModel();

var option_url = 'https://tw.movie.yahoo.com'; 
  options = {
    compressed         : true, // sets 'Accept-Encoding' to 'gzip,deflate' 
    follow_max         : 5,    // follow up to five redirects 
    rejectUnauthorized : false  // verify SSL certificate 
  },
  index = [],
  pages = [1,2,3,4,5,6,7,8],
  movieInfoIdx = {},
  cronJob = false;
/*
var theaterHash = { '南台電影城': '台南市中西區友愛街317號1樓',
  '國賓影城(台南國賓廣場)': '台南市東區中華東路一段66號3樓',
  '台南大遠百威秀影城': '台南市中西區公園路60號8樓',
  '全美戲院': '台南市中西區永福路二段187號',
  '今日戲院': '台南市中西區中正路249號',
  '麻豆戲院': '台南縣麻豆鎮興中路106號3樓',
  '台南新光影城': '台南市中西區西門路一段658號8樓',
  '台南南紡夢時代威秀影城': '台南市東區中華東路一段366號5樓',
  '台南南紡夢時代威秀影城(Gold Class頂級影廳)': '台南市中華東路一段366號5樓',
  '景美佳佳戲院': '台北市文山區羅斯福路6段403號4樓',
  '朝代戲院': '台北市大同區民權西路136號4樓',
  '湳山戲院': '台北市大安區通化街24巷1號',
  '友愛影城': '宜蘭縣宜蘭市舊城東路50號7樓',
  '日新戲院': '宜蘭縣羅東鎮中山西街17號之1',
  '日新戲院統一廳': '宜蘭縣羅東鎮公園路100號3樓',
  '新月豪華影城': '宜蘭縣宜蘭市民權路二段38巷2號 新月廣場3F',
  '花蓮秀泰影城': '花蓮縣花蓮市國聯五路69號',
  '國聲大戲院': '花蓮縣花蓮市林森路349號',
  '豪華戲院': '花蓮縣花蓮市明義街41號',
  'Tiger City威秀影城': '台中市西屯區河南路三段120號4樓',
  '台中新時代凱擘影城': '台中市東區復興路四段186號4樓',
  '日新大戲院': '台中市中華路一段58號',
  '親親數位影城': '台中市北區北屯路14號',
  '豐源國際影城': '台中縣豐原市中正路137號',
  '萬代福戲院': '台中市中區公園路38號',
  '全球影城': '台中市西區中華路一段1號之1',
  '台中新光影城': '台中市西屯區中港路二段111號13樓',
  '時代數位3D影城': '台中市清水區光復街65號3樓',
  'Tiger City威秀影城(Gold Class頂級影廳)': '台中市西屯區河南路三段120-1號4-6樓及1號3樓',
  '台中大遠百威秀影城': '台中市台中港路二段105號13樓',
  '華威台中影城': '台中市西區臺灣大道二段459號17樓',
  '台中站前秀泰影城(Love廳)': '台中市東區南京路76號',
  '台中站前秀泰影城': '台中市東區南京路76號',
  '台中站前秀泰影城(獨享廳)': '台中市東區南京路76號',
  '台中站前秀泰影城(巨幕廳)': '台中市東區南京路76號',
  '中影屏東影城': '屏東市民生路248號3、4樓',
  '國賓屏東環球影城': '屏東市仁愛路90號6、7樓',
  '民和戲院': '桃園縣八德市廣福路80號3樓',
  '統領戲院': '桃園縣桃園市中正路56號3-5樓',
  '美麗華台茂影城': '桃園縣蘆竹鄉南崁路一段112號7樓',
  '美麗華台茂影城(Royal Club皇家廳)': '桃園市蘆竹區南崁路一段112號7樓(台茂購物中心7樓)',
  '國賓影城(桃園八德廣豐新天地)': '桃園市八德區介壽路一段728號3樓',
  '高雄大遠百威秀影城': '高雄市苓雅區三多四路21號13樓',
  '高雄環球數位3D影城': '高雄市苓雅區大順三路108號',
  '喜滿客美奇萊影城': '高雄市三民區十全一路161號',
  '三多數位3D影城': '高雄市苓雅區三多四路123號',
  '和春影城': '高雄市三民區建興路391號',
  '十全數位3D影城': '高雄市三民區十全二路21號',
  '奧斯卡3D數位影城': '高雄市新興區仁智街287號',
  '岡山統一戲院': '高雄縣岡山鎮壽天路103號之10',
  '喜滿客夢時代影城': '高雄市前鎮區中華5路789號8樓',
  '國賓影城(高雄義大世界)': '高雄縣大樹鄉學城路一段12號3樓',
  '高雄大遠百威秀影城(Gold Class頂級影廳)': '高雄市苓雅區三多四路21號15樓',
  'MLD影城': '高雄市前鎮區忠勤路8號',
  'in89駁二電影院': '高雄市鹽埕區大勇路5-1號 (駁二藝術特區C1&C2倉庫)',
  '國賓影城(大魯閣草衙道)': '高雄市前鎮區中山四路100號3樓(大魯閣草衙道)',
  '高雄市電影館': '高雄市鹽埕區河西路10號',
  '基隆秀泰影城': '基隆市中正區信一路177號7-10F(基隆市文化中心旁)',
  '嘉年華影城': '嘉義市東區中山路617號',
  '新榮戲院': '嘉義市新榮路52號',
  '嘉義秀泰影城': '嘉義市西區文化路299號',
  '嘉義秀泰影城 (巨幕廳)': '嘉義市西區文化路299號',
  '金獅影城': '金門縣金湖鎮中山路8-5號(西棟3F)',
  '彰化戲院': '彰化縣彰化市中正路二段153號5樓',
  '台灣戲院': '彰化縣彰化市中正路二段48號',
  '員林3D影城': '彰化縣員林鎮南昌路39號3樓',
  '新竹大遠百威秀影城': '新竹市東區西大路323號8樓',
  '國際影城國際館': '新竹市文昌街39號',
  '新復珍戲院': '新竹市北門街6號1樓',
  '國際影城中興館': '新竹市東區林森路32號7樓',
  '新竹巨城威秀影城': '新竹市東區民權路176號4樓之3',
  '新竹大遠百威秀影城(Gold Class頂級影廳)': '新竹市西大路323號8樓',
  '信義威秀影城': '台北市信義區松壽路18號',
  '喜滿客京華影城': '台北市八德路四段138號B1(京華城購物中心地下一樓)',
  '國賓影城(微風廣場)': '台北市松山區復興南路一段39號10樓',
  '總督影城': '台北市松山區長安東路二段219號3樓',
  '哈拉數位影城': '台北市內湖區康寧路三段72號6樓',
  '大千電影院': '台北市松山區南京東路三段133號',
  '梅花數位影城': '台北市和平東路3段63號2F',
  '新民生戲院': '台北市松山區民生東路五段190號3樓',
  '誠品電影院': '台北市信義區菸廠路80號B2',
  '喜樂時代影城': '台北市南港區忠孝東路7段299號11、12、13、14樓',
  '台北新光影城': '台北市萬華區西寧南路36號4樓(西門町獅子林商業大樓)',
  'in89豪華數位影城': '台北市萬華區武昌街二段89號',
  '國賓大戲院(西門)': '台北市萬華區成都路88號',
  '樂聲影城': '台北市萬華區武昌街二段85號',
  '日新威秀影城': '台北市萬華區武昌街二段87號2樓',
  '真善美劇院': '台北市萬華區漢中街116號7樓',
  '喜滿客絕色影城': '台北市萬華區漢中街52號10、11樓',
  '今日秀泰影城': '台北市西門町峨眉街52號4樓',
  '京站威秀影城': '台北市大同區市民大道一段209號5樓',
  '光點華山電影館': '臺北市100中正區八德路一段1號（華山文創園區，中六館）',
  '百老匯數位影城': '台北市文山區羅斯福路四段200號 4 樓',
  '東南亞秀泰影城': '台北市中正區羅斯福路四段 136 巷 3 號',
  '國賓影城(台北長春廣場)': '台北市長春路176號',
  '欣欣秀泰影城': '台北市中山區林森北路247號4樓',
  '光點台北電影主題館': '台北市中山區中山北路2段18號',
  '美麗華(大直影城)': '台北市中山區敬業三路22號6樓',
  '華威天母影城': '台北市士林區忠誠路二段202號4樓',
  '士林陽明戲院': '台北市士林區文林路113號',
  '欣欣秀泰影城(VIP廳)': '台北市中山區林森北路247號3樓',
  '美麗華(大直影城)(M CLUB)': '台北市中山區敬業三路22號8樓',
  '美麗華(大直皇家影城)': '104 台北市中山區北安路780號B2',
  '三重幸福戲院': '新北市三重區三和路四段163巷12號',
  '鴻金寶麻吉影城': '新北市新莊區民安路188巷5號',
  '三重天台戲院': '新北市三重區重新路二段78號4F(天台廣場)',
  '國賓影城(中和環球購物中心)': '新北市中和區中山路三段122號4樓',
  '板橋大遠百威秀影城': '新北市板橋區新站路28號10樓',
  '板橋秀泰影城': '新北市板橋區縣民大道2段3號',
  '府中15': '新北市板橋區府中路15號B1',
  '國賓影城(林口昕境廣場)': '新北市林口區文化三路一段402巷2號4F（昕境廣場）',
  '國賓影城(新莊晶冠廣場)': '新北市新莊區五工路66號3F',
  '林口MITSUI OUTLET PARK威秀影城': '新北市林口區文化三路一段356號3樓',
  '林口MITSUI OUTLET PARK威秀影城(Mappa影廳)': '新北市林口區文化三路一段356號3樓',
  '中華電影城': '雲林縣斗六市雲林路二段19號',
  '虎尾白宮影城': '雲林縣虎尾鎮中正路257號',
  '中源戲院': '桃園縣中壢市日新路97號3樓之1',
  'SBC星橋國際影城': '桃園縣中壢市中園路二段509號6樓',
  '威尼斯影城': '桃園縣中壢市九和一街48號3樓',
  '埔里山明戲院': '南投縣埔里鎮中山路二段289號之1',
  '南投戲院': '南投縣南投市大同街87號',
  '澎湖中興電影城': '澎湖縣馬公市文康街37號',
  '頭份尚順威秀影城': '苗栗縣頭份鎮中央路105號7樓',
  '中影屏東影城': '屏東縣屏東市民生路248號',
  '台東秀泰影城': '台東市鐵花里5鄰新生路93號' };
*/
var theaterHash = CONSTANT.theatersHash;

var crawler = function (cronJob) { 
  if (!cronJob) {
    require('../models/db.js').connect(function (err) {
      if (err) {
        console.log('db error');
        throw err;
      }
    });
  }

 async.auto({
    get_index: function (cb) {
      needle.get(option_url, options, function (err, res) {
        if (!err && res.statusCode === 200) {
          var $ = cheerio.load(res.body);
          $('select[name="id"] option').each(function (i, elm) {
            if (i === 0) return;
              var text = $(elm).text();
              var val = $(elm).val();
              index.push(val);
              //console.log('text: %s, val: %s\n', text, val);
            });
            cb();
        } else {
          console.log(err);
          cb(err);
        }
      });
    },  
    rmOldData: function (cb) {
      console.log('Remove old data');
      movieTimeModel.removeMovieTime({}, function (err) {
        if (err) {
          cb(err);
        } else {
          console.log('Remove Done');
          cb(null);
        }
      }); 
    },
   crawler: ['get_index', 'rmOldData', function (result, cb) {
      async.eachLimit(index, 10, function (idx, callback) {
        var query_url = 'https://tw.movies.yahoo.com/movietime_result.html?id=' + idx;
        needle.get(query_url, options, function (err, res) {
          if (!err && res.statusCode === 200) {
            var $ = cheerio.load(res.body);
            //console.log($('div .text.bulletin h4').text());
            var name_zh = $('div .text.bulletin h4').text();
            //console.log($('div .text.bulletin h5').text());
            var name_en = $('div .text.bulletin h5').text();
            //console.log($('div .text.bulletin p span.dta').text());
            var release = $('div .text.bulletin p span.dta').text();

            // build info hash for get genre 
            movieInfoIdx[name_zh] = idx;

            $('div .row-container').each(function (i, elm) {
              var movies = {};
              var theater_info = {};
              theatersInfo = $(elm).text().trim().split(/\n/);
              /*
              text.trim().split(/\n/).forEach(function (t) {
                if (t !== ' ') {
                  movies.push(t);
                }
              });
              */
              movies.name_zh = name_zh;
              movies.name_en = name_en;
              movies.release = release;

              var theaterInfo = theatersInfo[0].split(' ');
              var len = theaterInfo.length;
              theater_info.name = theaterInfo.slice(0, len - 2).join(' ');
              // special case to crawler correct data
              if (theater_info.name.includes('中影屏東影城')) {
                theater_info.name = theater_info.name.split(' ')[0];
              }
              theater_info.tel = theaterInfo[len-2];
              theater_info.address = theaterHash[theater_info.name];
              movies.theater_info = theater_info;
              movies.movie_time = theatersInfo[3];
              movieTimeModel.createMovieTime(movies, function (json) {
                //console.log(json);
                return;
              }); 
//              console.log(JSON.stringify(movies));
            });
          } else {
            console.log(err);
          }
          callback();
        });
      }, function (err) {
         if (err) {
           console.log(err);
           cb(err);
         } else {
           cb();
         }
      });
    }],
    crawler_unreleased: ['crawler', function (result, cb) {
      async.eachLimit(pages, 5, function (page, callback) {
        var query_url = 'https://tw.movies.yahoo.com/movie_comingsoon.html?p=' + page;
        needle.get(query_url, options, function (err, res) {
          if (!err && res.statusCode === 200) {
            var $ = cheerio.load(res.body);

            $('div .text').each(function (i, elm) {
              var $$ = cheerio.load(elm);
              
              var movies = {};
              var idx = $$('h4 a').attr('href');
              movies.name_zh = $$('h4').text();
              movies.name_en = $$('h5').text();
              //console.log($$('span.date span').text()); 
              movies.release = $$('span.date span').text(); 
              // build info hash for get genre 
              movieInfoIdx[movies.name_zh] = idx;

              movieTimeModel.createMovieTime(movies, function (json) {
                //console.log(json);
                return;
              }); 
            });
          } else {
            console.log(err);
          }
          callback();
        });
      }, function (err) {
         if (err) {
           console.log(err);
           cb(err);
         } else {
           cb();
         }
      });
    }],
    crawler_genre: ['crawler_unreleased', function (result, cb) {
      async.eachLimit(movieInfoIdx, 5, function (idx, callback) {
        if (idx !== undefined && idx.includes('https')) {
          idx = idx.split('=')[1];
        }
        var query_url = 'https://tw.movies.yahoo.com/movieinfo_main.html/id=' + idx;
        needle.get(query_url, options, function (err, res) {
          if (!err && res.statusCode === 200) {
            var $ = cheerio.load(res.body);
            var movies = {};
            movies.name_zh = $('div .text.bulletin h4').text();
            $('div .text.bulletin p span').each(function (i, elm) {
              if (i != 3) return;
              var $$ = cheerio.load(elm);
              movies.genre = $$('.dta').text();
              movieTimeModel.updateMovieTime(movies, function (json) {
                //console.log(json)
                return;
              }); 
            });
          } else {
            console.log(err);
          }
          callback();
        });
      }, function (err) {
         if (err) {
           console.log(err);
           cb(err);
         } else {
           cb();
         }
      });
    }]
  }, function (err, result) {
    if (err) {
      console.log(err);
    }
    if (!cronJob) {
      require('../models/db').disconnect(
        function (err) {
          if (err) {
            console.log(err); 
          }
        }
      );
    }  
    console.log('done');
  });  
};

var startJob = function () {
  cronJob = true;
  console.log('Start crawler schedule Job');
  schedule.scheduleJob('* * 2 * * *', function () {
    crawler(cronJob);    
  });
};

module.exports = {
  startJob: startJob,
  crawler: crawler
};
