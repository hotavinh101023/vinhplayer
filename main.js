const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'Vinh'

const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBTN = $('.btn-toggle-play')
const play = $('.player')
const progress = $('#progress')
const nextBTN = $('.btn-next')
const prevBTN = $('.btn-prev')
const randomBTN = $('.btn-random')
const repeatBTN = $('.btn-repeat')
const playList = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    songs: [{
            name: 'All fall down',
            singer: 'Alan walker',
            path: './song1.mp3',
            img: './1.jpg',
        },
        {
            name: 'Đám cưới nha',
            singer: 'Hồng Thanh',
            path: './song2.mp3',
            img: './2.jpg',
        },
        {
            name: 'Tướng quân',
            singer: 'Nhật Phong',
            path: './song3.mp3',
            img: './3.jpg',
        },
        {
            name: 'My love',
            singer: 'Westlife',
            path: './song4.mp3',
            img: './4.jpg',
        },
        {
            name: 'Âm thầm bên em',
            singer: 'Sơn Tùng - MTP',
            path: './song5.mp3',
            img: './5.jpg',
        },
        {
            name: 'Anh vẫn ở đây',
            singer: 'Thành Đạt',
            path: './song6.mp3',
            img: './6.jpg',
        },
        {
            name: 'Chẳng thể tìm được em',
            singer: 'PhucXP',
            path: './song7.mp3',
            img: './7.jpg',
        },
        {
            name: 'Đào nương',
            singer: 'Hoàng Vương',
            path: './song8.mp3',
            img: './8.jpg',
        },
    ],
    render: function() {
        const htmls = this.songs.map(function(song, index) {
            return `<div class="song ${index === app.currentIndex ? 'active': ''}" data-index="${index}">
            <div
              class="thumb"
              style="
                background-image: url('${song.img}');
              "
            ></div>
            <div class="body">
              <h3 class="title">${song.name}</h3>
              <p class="author">${song.singer}</p>
            </div>
            <div class="option">
              <i class="fas fa-ellipsis-h"></i>
            </div>
          </div>`
        })
        playList.innerHTML = htmls.join('')
    },
    handleEnvents: function() {
        const _this = this
        const cdWidth = cd.offsetWidth
            // Xu li quay cd
        var cdThumbAnimate = cdThumb.animate([{ transform: 'rotate(360deg)' }], {
            duration: 10000,
            interations: Infinity,
        })
        cdThumbAnimate.pause()

        // Xu li scroll CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xu li play btn
        playBTN.onclick = function() {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        // Song is playing
        audio.onplay = function() {
            _this.isPlaying = true
            play.classList.add('playing')
            cdThumbAnimate.play()
        }

        // Song is pause
        audio.onpause = function() {
            _this.isPlaying = false
            play.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // tien do bai hat
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progresspercent = Math.floor(
                    (audio.currentTime / audio.duration) * 100,
                )
                progress.value = progresspercent
            }
        }

        progress.onchange = function() {
            const timechange = Math.floor((progress.value / 100) * audio.duration)
            audio.currentTime = timechange
        }

        // Next song
        nextBTN.onclick = function() {
            if (_this.isRandom) {
                _this.randomSong()
            } else {
                _this.nextSong()
            }
            _this.render();
            if (_this.currentIndex === 1 || _this.currentIndex === 2) {
                _this.scrollToActiveSongFirstSecond();
            } else {
                _this.scrollToActiveSong();
            }
            var playPromise = audio.play()
            if (playPromise !== undefined) {
                playPromise
                    .then((_) => {
                        audio.play()
                    })
                    .catch((error) => {
                        audio.play()
                    })
            }
        }

        // Prev song
        prevBTN.onclick = function() {
            if (_this.isRandom) {
                _this.randomSong()
            } else {
                _this.prevSong()
            }
            _this.render();
            if (_this.currentIndex === 0 || _this.currentIndex === 1) {
                _this.scrollToActiveSongFirstSecond();
            } else {
                _this.scrollToActiveSong();
            }
            var playPromise = audio.play()
            if (playPromise !== undefined) {
                playPromise
                    .then((_) => {
                        audio.play()
                    })
                    .catch((error) => {
                        audio.play()
                    })
            }
        }

        // random song
        randomBTN.onclick = function() {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBTN.classList.toggle('active', _this.isRandom)
        }

        // Repeat song
        repeatBTN.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBTN.classList.toggle('active', _this.isRepeat)
        }

        // Xu li next song khi audio ended
        audio.onended = function() {
            if (_this.isRepeat) {
                _this.repeatSong()
            } else if (_this.isRandom) {
                _this.randomSong()
            } else {
                _this.nextSong()
            }
            _this.render();
            if (_this.currentIndex === 0 || _this.currentIndex === 1) {
                _this.scrollToActiveSongFirstSecond();
            } else {
                _this.scrollToActiveSong();
            }
            var playPromise = audio.play()
            if (playPromise !== undefined) {
                playPromise
                    .then((_) => {
                        audio.play()
                    })
                    .catch((error) => {
                        audio.play()
                    })
            }
        }

        // Xu li click vao play list
        playList.onclick = function(e) {
            var songE = e.target.closest('.song:not(.active .option)')
            if (songE || e.target.closest('.option')) {
                // click song
                if (songE) {
                    _this.currentIndex = Number(songE.dataset.index);
                    _this.loadCurrentSong();
                    audio.play();
                    _this.render();
                }
                // xu li khi click vao option
                if (e.target.closest('.option')) {

                }
            }
        }
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    scrollToActiveSong() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        }, 200)
    },
    scrollToActiveSongFirstSecond() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            })
        }, 200)
    },
    nextSong() {
        this.currentIndex++
            if (this.currentIndex >= this.songs.length) {
                this.currentIndex = 0
            }
        this.loadCurrentSong()
    },
    prevSong() {
        this.currentIndex--
            if (this.currentIndex < 0) {
                this.currentIndex = this.songs.length - 1
            }
        this.loadCurrentSong()
    },
    randomSong() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    repeatSong() {
        this.loadCurrentSong();
    },
    defineProperties() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            },
        })
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.img}')`
        audio.src = this.currentSong.path
    },
    start: function() {
        // gan cau hinh tu config vao app
        this.loadConfig();

        //  Dinh nghia thuoc tinh cho object
        this.defineProperties()

        // Xu li su kien
        this.handleEnvents()

        // Tai thong tin bai hat dau tien khi chay ung dung
        this.loadCurrentSong()

        // Render playlist
        this.render()

        // Hien thi trang thai ban dau cua button
        randomBTN.classList.toggle('active', this.isRandom)
        repeatBTN.classList.toggle('active', this.isRepeat)
    },
}

app.start()
