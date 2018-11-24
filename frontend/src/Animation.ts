/// <reference path="../types//p5.global-mode.d.ts" />
import 'p5'
import {debug} from './utils'

export default class Anim {
    imageList: p5.Image[]

    constructor(s:any, ...imgs: string[]) {
        this.imageList = imgs.map((location) => {
            debug(`Loading image: ${location}`)
            return s.loadImage(location)
        })
    }
}