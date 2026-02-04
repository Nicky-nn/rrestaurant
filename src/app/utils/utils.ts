import { differenceInSeconds } from 'date-fns'
import { round } from 'lodash'

/**
 * @author isi-template
 * @param hex
 */
export const convertHexToRGB = (hex: string) => {
  // check if it's a rgba
  if (hex.match('rgba')) {
    return hex.slice(5).split(',').slice(0, -1).join(',')
  }
  let c: any
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('')
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]]
    }
    c = '0x' + c.join('')
    return [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',')
  }
}

/**
 * @author isi-template
 * @param func
 * @param wait
 * @param immediate
 */
export function debounce(func: any, wait: number, immediate: any) {
  let timeout: any
  return function (this: any) {
    let context = this,
      args = arguments
    clearTimeout(timeout)
    timeout = setTimeout(function () {
      timeout = null
      if (!immediate) func.apply(context, args)
    }, wait)
    if (immediate && !timeout) func.apply(context, args)
  }
}

/**
 * @author isi-template
 */
export function isMobile() {
  if (window) {
    return window.matchMedia(`(max-width: 767px)`).matches
  }
  return false
}

/**
 * @author isi-template
 */
export function isMdScreen() {
  if (window) {
    return window.matchMedia(`(max-width: 1199px)`).matches
  }
  return false
}

/**
 * @author isi-template
 * @param elm
 */
function currentYPosition(elm: any) {
  if (!window && !elm) {
    return
  }
  if (elm) return elm.scrollTop
  // Firefox, Chrome, Opera, Safari
  if (window.pageYOffset) return window.pageYOffset
  // Internet Explorer 6 - standards mode
  if (document.documentElement && document.documentElement.scrollTop)
    return document.documentElement.scrollTop
  // Internet Explorer 6, 7 and 8
  if (document.body.scrollTop) return document.body.scrollTop
  return 0
}

/**
 * @author isi-template
 * @param elm
 */
function elmYPosition(elm: any) {
  let y = elm.offsetTop
  let node = elm
  while (node.offsetParent && node.offsetParent !== document.body) {
    node = node.offsetParent
    y += node.offsetTop
  }
  return y
}

/**
 * @author isi-template
 * @param scrollableElement
 * @param elmID
 */
export function scrollTo(scrollableElement: any, elmID: any) {
  var elm = document.getElementById(elmID)

  if (!elmID || !elm) {
    return
  }

  var startY = currentYPosition(scrollableElement)
  var stopY = elmYPosition(elm)

  var distance = stopY > startY ? stopY - startY : startY - stopY
  if (distance < 100) {
    scrollTo(0, stopY)
    return
  }
  var speed = Math.round(distance / 50)
  if (speed >= 20) speed = 20
  var step = Math.round(distance / 25)
  var leapY = stopY > startY ? startY + step : startY - step
  var timer = 0
  if (stopY > startY) {
    for (var i = startY; i < stopY; i += step) {
      setTimeout(
        (function (leapY) {
          return () => {
            scrollableElement.scrollTo(0, leapY)
          }
        })(leapY),
        timer * speed,
      )
      leapY += step
      if (leapY > stopY) leapY = stopY
      timer++
    }
    return
  }
  for (let i = startY; i > stopY; i -= step) {
    setTimeout(
      (function (leapY) {
        return () => {
          scrollableElement.scrollTo(0, leapY)
        }
      })(leapY),
      timer * speed,
    )
    leapY -= step
    if (leapY < stopY) leapY = stopY
    timer++
  }
  return false
}

/**
 * @author isi-template
 * @param date
 */
export function getTimeDifference(date: any) {
  let difference = differenceInSeconds(new Date(), date)

  if (difference < 60) {
    return `${Math.floor(difference)} sec`
  } else if (difference < 3600) {
    return `${Math.floor(difference / 60)} min`
  } else if (difference < 86400) {
    return `${Math.floor(difference / 3660)} h`
  } else if (difference < 86400 * 30) {
    return `${Math.floor(difference / 86400)} d`
  } else if (difference < 86400 * 30 * 12) {
    return `${Math.floor(difference / 86400 / 30)} mon`
  } else {
    return `${(difference / 86400 / 30 / 12).toFixed(1)} y`
  }
}

/**
 * @author isi-template
 */
export function generateRandomId() {
  let tempId = Math.random().toString()
  let uid = tempId.substr(2, tempId.length - 1)
  return uid
}

/**
 * @author isi-template
 * @param prop
 */
export function getQueryParam(prop: any) {
  let params: any = {}
  let search = decodeURIComponent(
    window.location.href.slice(window.location.href.indexOf('?') + 1),
  )
  let definitions = search.split('&')
  definitions.forEach(function (val, key) {
    let parts = val.split('=', 2)
    params[parts[0]] = parts[1]
  })
  return prop && prop in params ? params[prop] : params
}

/**
 * @author isi-template
 * @param classes
 */
export function classList(classes: any) {
  return Object.entries(classes)
    .filter((entry) => entry[1])
    .map((entry) => entry[0])
    .join(' ')
}

/**
 * @author isi-template
 * @param array
 */
export const flat = (array: any) => {
  let result: Array<any> = []
  array.forEach(function (a: any) {
    result.push(a)
    if (Array.isArray(a.children)) {
      result = result.concat(flat(a.children))
    }
  })
  return result
}

/**
 * Redondeamos un valor numerico a n decimales
 * @author isi-template
 * @param val
 * @param places
 */
export const genRound = (val: any, places = 2) => {
  try {
    if (val === undefined) return 0
    if (val === null) return 0
    return round(round(val, 5), places)
  } catch (e: any) {
    throw new Error(e.message)
  }
}
