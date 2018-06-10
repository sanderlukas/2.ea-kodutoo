/* TYPER */
const TYPER = function () {
  if (TYPER.instance_) {
    return TYPER.instance_
  }
  TYPER.instance_ = this

  this.WIDTH = window.innerWidth
  this.HEIGHT = window.innerHeight
  this.canvas = null
  this.ctx = null

  this.words = []
  this.word = null
  this.wordMinLength = 5
  this.guessedWords = 0
  this.streak = 0
  this.score = 0
  this.rightGuess = true
  this.mySound = new sound('err.wmv.mp3')
  this.startTime = new Date().getTime()
  this.counter
  this.playerName = localStorage.getItem('name')
  localStorage.removeItem('name')

  this.init()
}

window.TYPER = TYPER

TYPER.prototype = {
  init: function () {
    this.canvas = document.getElementsByTagName('canvas')[0]
    this.ctx = this.canvas.getContext('2d')

    if (this.playerName === '') {
      this.playerName = 'UnknownPlayer'
    }

    this.canvas.style.width = this.WIDTH + 'px'
    this.canvas.style.height = this.HEIGHT + 'px'

    this.canvas.width = this.WIDTH * 2
    this.canvas.height = this.HEIGHT * 2

    this.loadWords()
  },

  loadWords: function () {
    const xmlhttp = new XMLHttpRequest()

    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4 && (xmlhttp.status === 200 || xmlhttp.status === 0)) {
        const response = xmlhttp.responseText
        const wordsFromFile = response.split('\n')

        typer.words = structureArrayByWordLength(wordsFromFile)

        typer.start()
      }
    }

    xmlhttp.open('GET', './lemmad2013.txt', true)
    xmlhttp.send()
  },

  start: function () {
    this.generateWord()
    this.word.Draw()

    window.addEventListener('keypress', this.keyPressed.bind(this))
  },

  generateWord: function () {
    const generatedWordLength = this.wordMinLength + parseInt(this.guessedWords / 5)
    const randomIndex = (Math.random() * (this.words[generatedWordLength].length - 1)).toFixed()
    const wordFromArray = this.words[generatedWordLength][randomIndex]

    if (this.checkTime()) {
      this.endGame()
      return
    }

    this.word = new Word(wordFromArray, this.canvas, this.ctx, this.score)
  },

  keyPressed: function (event) {
    const letter = String.fromCharCode(event.which)

    if (letter === this.word.left.charAt(0)) {
      this.word.removeFirstLetter()

      if (this.word.left.length === 0) {
        this.guessedWords += 1
        this.score += 10
        this.streak++

        if (this.streak === 5) {
          this.score += 25
          this.streak = 0
        }

        this.generateWord()
      }
    } else {
      this.rightGuess = false
      this.mySound.play()
      this.score -= 1
      this.streak = 0
    }
    this.word.Draw()
  },

  checkTime: function () {
    const currentTime = new Date().getTime()
    this.counter = currentTime - this.startTime
    if (this.counter >= 60000) {
      return true
    }
    return false
  },

  endGame: function () {
    document.body.innerHTML = ''
    const readScores = localStorage.getItem('Scores')
    if (readScores) {
      const playerScores = JSON.parse(readScores)
      const p = { name: typer.playerName, score: this.score, words: this.guessedWords }
      playerScores.push(p)
      localString = JSON.stringify(playerScores)
      localStorage.setItem('Scores', localString)
    } else {
      const arr = []
      const p1 = { name: typer.playerName, score: this.score, words: this.guessedWords }
      arr.push(p1)
      localString = JSON.stringify(arr)
      localStorage.setItem('Scores', localString)
    }

    const line = document.createElement('p')
    const line2 = document.createElement('p')
    const ulist = document.createElement('ul')
    line.innerHTML = 'DONE!'
    line2.innerHTML = 'You scored ' + this.score + ' points and guessed ' + this.guessedWords + ' words + <br>'
    document.body.appendChild(line)
    document.body.appendChild(line2)
    document.body.appendChild(ulist)
    for (let i = 0; i < 10; i++) {
      const line3 = document.createElement('li')
      const readScores = localStorage.getItem('Scores')
      const playerScores = JSON.parse(readScores)
      line3.innerHTML = playerScores[i].name + ' ' + playerScores[i].score + ' points'
      ulist.appendChild(line3)
    }
  }
}

/* WORD */
const Word = function (word, canvas, ctx, score) {
  this.word = word
  this.left = this.word
  this.canvas = canvas
  this.ctx = ctx
  this.score = score
}

Word.prototype = {
  Draw: function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    if (typer.rightGuess) {
      this.ctx.fillStyle = 'black'
    } else {
      this.ctx.fillStyle = 'red'
    }

    this.ctx.textAlign = 'center'
    this.ctx.font = '140px Courier'
    this.ctx.fillText(this.left, this.canvas.width / 2, this.canvas.height / 2)
    this.ctx.font = '50px Courier'
    this.ctx.fillStyle = 'black'
    this.ctx.fillText("Score: " + this.score, this.canvas.width / 2, this.canvas.height / 2 + 100)
  },

  removeFirstLetter: function () {
    this.left = this.left.slice(1)
    typer.rightGuess = true  
  }
}

/* HELPERS */
function structureArrayByWordLength (words) {
  let tempArray = []

  for (let i = 0; i < words.length; i++) {
    const wordLength = words[i].length
    if (tempArray[wordLength] === undefined) tempArray[wordLength] = []

    tempArray[wordLength].push(words[i])
  }

  return tempArray
}

function startGame () {
  localStorage.setItem('name', document.getElementById('pname').value)
  document.body.innerHTML = ''
  const canv = document.createElement('canvas')
  document.body.appendChild(canv)
  const typer = new TYPER()
  window.typer = typer
}

function sound (src) {
  this.sound = document.createElement('audio')
  this.sound.src = src
  this.sound.setAttribute('preload', 'auto')
  this.sound.setAttribute('controls', 'none')
  this.sound.style.display = 'none'
  document.body.appendChild(this.sound)
  this.play = function () {
      this.sound.play()
  }
  this.stop = function () {
      this.sound.pause()
  }
}

window.onload = function () {
  document.querySelector('#startBtn').addEventListener('click', startGame)
}
