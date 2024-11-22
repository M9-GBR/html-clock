class Clock {
    _width = 500
    radius = this._width / 2
    tickSound = document.querySelector('audio')
    timeData = {
        seconds: 0, minutes: 0, hours: 0,
        update() {
            this.seconds = new Date().getSeconds()
            this.minutes = new Date().getMinutes()
            this.hours = new Date().getHours() - 12
        }
    }

    constructor(canvas) {
        if (canvas != null) {
            this.canvas = canvas
        } else this.createCanvas()

        this.ctx = this.canvas.getContext('2d')

        this.canvas.width = this._width
        this.canvas.height = this._width

        this.makeBody()
        this.startTicking()
    }

    createCanvas() {
        this.canvas = document.createElement('canvas')
        document.body.appendChild(this.canvas)
    }

    set width(num) {
        if (num >= 100) {
            this._width = num
            this.canvas.width = num
            this.canvas.height = num
            this.radius = this._width / 2
            this.makeBody()
            this.updateClock()
        } else console.error('Clock Width Too Small')
    }

    makeBody() {
        this.ctx.reset()
        this.ctx.lineWidth = this._width / 100

        this.ctx.shadowColor = 'black'
        this.ctx.shadowBlur = this._width / 100
        this.ctx.fillStyle = 'white'
        this.ctx.beginPath()
        this.ctx.arc(this.radius, this.radius, (this.radius) - this.ctx.lineWidth, 0, Math.PI * 2)
        this.ctx.stroke()
        this.ctx.shadowBlur = 0
        this.ctx.fill()

        this.makeClockNums()
    }

    makeClockNums() {
        let ctx = this.ctx

        ctx.font = `${this._width / 10}px calibri`
        ctx.fillStyle = 'black'
        ctx.textBaseline = 'top'
        let pad = this._width / 40, curText = '', m = ctx.measureText('')

        curText = '12'
        m = ctx.measureText(curText)
        ctx.fillText(curText, (this.radius) - (m.width / 2), pad)

        curText = '3'
        m = ctx.measureText(curText)
        ctx.fillText(curText, this._width - m.width - pad, (this.radius) - (m.actualBoundingBoxDescent - m.actualBoundingBoxAscent) / 2)

        curText = '6'
        m = ctx.measureText(curText)
        ctx.fillText(
            curText, (this.radius) - (m.width / 2),
            this._width - (m.actualBoundingBoxDescent - m.actualBoundingBoxAscent) - pad
        )

        curText = '9'
        m = ctx.measureText(curText)
        ctx.fillText(curText, pad, (this.radius) - (m.actualBoundingBoxDescent - m.actualBoundingBoxAscent) / 2)

        let points = [], iter = 2
        for (let i = 0; i < 360; i += 30) {
            let angle = Math.PI * i / 180,
                x = this.radius + this.radius * Math.cos(angle),
                y = this.radius + this.radius * Math.sin(angle)

            points.push([x, y])
        }

        for (let point of points) {
            if (iter == 2) {
                iter = 0
                continue
            }

            iter++

            let dx = this.radius - point[0],
                dy = this.radius - point[1]

            let dist = Math.round(Math.hypot(dx, dy))

            let p = []

            for (let i = 0; i < dist; i++) {
                let t = i / dist,
                    x = point[0] + t * dx,
                    y = point[1] + t * dy
                p.push([x, y])
            }

            p = p.slice(this._width / 40, this._width / 10)

            ctx.strokeStyle = '#222'
            ctx.beginPath()
            ctx.moveTo(p[0][0], p[0][1])
            ctx.lineTo(p[p.length - 1][0], p[p.length - 1][1])
            ctx.stroke()
        }
    }

    startTicking() {
        this.updateClock()
        this.interval = setInterval(() => this.updateClock(), 1000)
    }

    stopTicking() {
        clearInterval(this.interval)
    }

    updateClock() {
        this.makeBody()
        this.timeData.update()
        this.drawHands()

        this.tickSound.currentTime = 0
        this.tickSound.play()
    }

    drawHands() {
        // min-hand
        let minAngle = (Math.PI * (((this.timeData.minutes * 60) + this.timeData.seconds) / 10 - 90) / 180)
        let startX = this.radius - (this._width / 10) * Math.cos(minAngle),
            startY = this.radius - (this._width / 10) * Math.sin(minAngle),
            endX = this.radius + (this._width / 2.4) * Math.cos(minAngle),
            endY = this.radius + (this._width / 2.4) * Math.sin(minAngle)

        this.ctx.strokeStyle = 'black'
        this.ctx.lineWidth = this._width / 75
        this.ctx.beginPath()
        this.ctx.moveTo(startX, startY)
        this.ctx.lineTo(endX, endY)
        this.ctx.stroke()

        //hr-hand
        let hrAngle = (Math.PI * (((this.timeData.hours * 60 * 60) + (this.timeData.minutes * 60) + this.timeData.seconds) / 120 - 90) / 180)
        startX = this.radius - (this._width / 10) * Math.cos(hrAngle)
        startY = this.radius - (this._width / 10) * Math.sin(hrAngle)
        endX = this.radius + (this._width / 4) * Math.cos(hrAngle)
        endY = this.radius + (this._width / 4) * Math.sin(hrAngle)

        this.ctx.beginPath()
        this.ctx.moveTo(startX, startY)
        this.ctx.lineTo(endX, endY)
        this.ctx.stroke()

        //sec-hand
        let secAngle = (Math.PI * ((this.timeData.seconds * 6) - 90) / 180)
        startX = this.radius - (this._width / 6) * Math.cos(secAngle)
        startY = this.radius - (this._width / 6) * Math.sin(secAngle)
        endX = this.radius + (this._width / 2.5) * Math.cos(secAngle)
        endY = this.radius + (this._width / 2.5) * Math.sin(secAngle)

        this.ctx.strokeStyle = 'red'
        this.ctx.lineWidth = 1
        this.ctx.beginPath()
        this.ctx.moveTo(startX, startY)
        this.ctx.lineTo(endX, endY)
        this.ctx.stroke()

        this.ctx.fillStyle = 'red'
        this.ctx.beginPath()
        this.ctx.arc(startX, startY, this._width / 50, 0, Math.PI * 2)
        this.ctx.fill()

        //hand-knob
        this.ctx.fillStyle = '#222'
        this.ctx.beginPath()
        this.ctx.arc(this.radius, this.radius, this._width / 50, 0, Math.PI * 2)
        this.ctx.fill()
    }
}


window.clock = new Clock(document.getElementById('clock'))