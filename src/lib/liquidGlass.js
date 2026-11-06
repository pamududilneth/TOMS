/*
 * Liquid glass core
 * Based on liquid-glass by Shu Ding (https://github.com/shuding/liquid-glass)
 *
 * How it works:
 *   1. A "fragment" function says, for every pixel of the element, where the
 *      pixel behind it should be sampled from (like a tiny shader).
 *   2. Those offsets are drawn into a canvas as a red/green image (the displacement map).
 *   3. An SVG <feDisplacementMap> filter reads that image.
 *   4. The element uses backdrop-filter: url(#filter), so everything behind it is bent.
 *
 * Usage:
 *   const glass = attachLiquidGlass(document.querySelector('.card'));
 *   glass.update();   // call if you change the fragment or the size changes without a resize
 *   glass.destroy();  // remove the effect
 *
 * The element needs something visible behind it (an image, text, gradient) and
 * a border-radius if you want rounded edges. Works in Chromium browsers
 * (Chrome, Edge, Opera). Others fall back to a plain blur.
 */
; (function (global) {
    'use strict'

    var SVG_NS = 'http://www.w3.org/2000/svg'
    var XLINK_NS = 'http://www.w3.org/1999/xlink'

    // ---------- math helpers ----------

    function smoothStep(a, b, t) {
        t = Math.max(0, Math.min(1, (t - a) / (b - a)))
        return t * t * (3 - 2 * t)
    }

    function length(x, y) {
        return Math.sqrt(x * x + y * y)
    }

    // Signed distance from point (x, y) to a rounded rectangle centred on 0.
    // width/height are half-sizes, radius is the corner radius.
    function roundedRectSDF(x, y, width, height, radius) {
        var qx = Math.abs(x) - width + radius
        var qy = Math.abs(y) - height + radius
        return (
            Math.min(Math.max(qx, qy), 0) +
            length(Math.max(qx, 0), Math.max(qy, 0)) -
            radius
        )
    }

    // Return the point (0..1) of the backdrop that this pixel should show.
    function texture(x, y) {
        return { x: x, y: y }
    }

    // ---------- the lens shape (edit this to change the look) ----------
    //
    // uv is the pixel position inside the element, 0..1 on both axes.
    // Return texture(x, y): the position to sample from instead.
    // Returning texture(uv.x, uv.y) means "no distortion".
    function defaultFragment(uv) {
        var ix = uv.x - 0.5
        var iy = uv.y - 0.5
        var distanceToEdge = roundedRectSDF(ix, iy, 0.3, 0.2, 0.6)
        var displacement = smoothStep(0.8, 0, distanceToEdge - 0.15)
        var scaled = smoothStep(0, 1, displacement)
        return texture(ix * scaled + 0.5, iy * scaled + 0.5)
    }

    // ---------- displacement map ----------

    // The map is computed at a reduced size for speed and stretched by the SVG filter.
    function buildMap(canvas, context, mapW, mapH, fragment) {
        canvas.width = mapW
        canvas.height = mapH

        var data = new Uint8ClampedArray(mapW * mapH * 4)
        var raw = new Float32Array(mapW * mapH * 2)
        var maxScale = 0
        var n = 0

        for (var i = 0; i < data.length; i += 4) {
            var x = (i / 4) % mapW
            var y = Math.floor(i / 4 / mapW)
            var pos = fragment({ x: x / mapW, y: y / mapH })
            var dx = pos.x * mapW - x
            var dy = pos.y * mapH - y
            maxScale = Math.max(maxScale, Math.abs(dx), Math.abs(dy))
            raw[n++] = dx
            raw[n++] = dy
        }

        maxScale = Math.max(maxScale * 0.5, 1)

        n = 0
        for (var j = 0; j < data.length; j += 4) {
            data[j] = (raw[n++] / maxScale + 0.5) * 255 // red   = x offset
            data[j + 1] = (raw[n++] / maxScale + 0.5) * 255 // green = y offset
            data[j + 2] = 0
            data[j + 3] = 255
        }

        context.putImageData(new ImageData(data, mapW, mapH), 0, 0)
        return { url: canvas.toDataURL(), scale: maxScale }
    }

    // ---------- main ----------

    function attachLiquidGlass(el, options) {
        var o = Object.assign(
            {
                fragment: defaultFragment, // (uv) => texture(x, y)
                maxMapSize: 300, // longest side of the computed map, in pixels
                blur: 0.25, // px, applied together with the refraction
                contrast: 1.2,
                brightness: 1.05,
                saturate: 1.1,
                fallbackBlur: 6, // px, used by browsers without url() backdrop filters
            },
            options || {},
        )

        var id = 'liquid-glass-' + Math.random().toString(36).slice(2, 11)

        var svg = document.createElementNS(SVG_NS, 'svg')
        svg.setAttribute('width', '0')
        svg.setAttribute('height', '0')
        svg.style.cssText = 'position:fixed;top:0;left:0;pointer-events:none;'

        var defs = document.createElementNS(SVG_NS, 'defs')
        var filter = document.createElementNS(SVG_NS, 'filter')
        filter.setAttribute('id', id + '_filter')
        filter.setAttribute('filterUnits', 'userSpaceOnUse')
        filter.setAttribute('color-interpolation-filters', 'sRGB')
        filter.setAttribute('x', '0')
        filter.setAttribute('y', '0')

        var feImage = document.createElementNS(SVG_NS, 'feImage')
        feImage.setAttribute('id', id + '_map')
        feImage.setAttribute('preserveAspectRatio', 'none')

        var feDisplacementMap = document.createElementNS(SVG_NS, 'feDisplacementMap')
        feDisplacementMap.setAttribute('in', 'SourceGraphic')
        feDisplacementMap.setAttribute('in2', id + '_map')
        feDisplacementMap.setAttribute('xChannelSelector', 'R')
        feDisplacementMap.setAttribute('yChannelSelector', 'G')

        filter.appendChild(feImage)
        filter.appendChild(feDisplacementMap)
        defs.appendChild(filter)
        svg.appendChild(defs)
        document.body.appendChild(svg)

        var canvas = document.createElement('canvas')
        var context = canvas.getContext('2d')

        var tail =
            ' contrast(' + o.contrast + ') brightness(' + o.brightness +
            ') saturate(' + o.saturate + ')'
        var fallback = 'blur(' + o.fallbackBlur + 'px)' + tail
        var full = 'url(#' + id + '_filter) blur(' + o.blur + 'px)' + tail

        // Fallback first. A browser that cannot parse url() keeps this one.
        el.style.setProperty('-webkit-backdrop-filter', fallback)
        el.style.setProperty('backdrop-filter', fallback)
        el.style.setProperty('backdrop-filter', full)

        function update() {
            var rect = el.getBoundingClientRect()
            var width = Math.round(rect.width)
            var height = Math.round(rect.height)
            if (!width || !height) return

            var k = Math.min(1, o.maxMapSize / Math.max(width, height))
            var mapW = Math.max(1, Math.round(width * k))
            var mapH = Math.max(1, Math.round(height * k))

            var map = buildMap(canvas, context, mapW, mapH, o.fragment)

            filter.setAttribute('width', String(width))
            filter.setAttribute('height', String(height))
            feImage.setAttribute('width', String(width))
            feImage.setAttribute('height', String(height))
            feImage.setAttribute('href', map.url)
            feImage.setAttributeNS(XLINK_NS, 'href', map.url)
            // Offsets were measured in map pixels; convert to element pixels.
            feDisplacementMap.setAttribute('scale', String(map.scale / k))
        }

        var observer = null
        if (typeof ResizeObserver !== 'undefined') {
            observer = new ResizeObserver(update)
            observer.observe(el)
        }
        update()

        return {
            update: update,
            destroy: function () {
                if (observer) observer.disconnect()
                el.style.removeProperty('backdrop-filter')
                el.style.removeProperty('-webkit-backdrop-filter')
                svg.remove()
            },
        }
    }

    global.attachLiquidGlass = attachLiquidGlass
    global.liquidGlassHelpers = {
        smoothStep: smoothStep,
        roundedRectSDF: roundedRectSDF,
        texture: texture,
        defaultFragment: defaultFragment,
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            attachLiquidGlass: attachLiquidGlass,
            smoothStep: smoothStep,
            roundedRectSDF: roundedRectSDF,
            texture: texture,
            defaultFragment: defaultFragment,
        }
    }
})(typeof window !== 'undefined' ? window : this)