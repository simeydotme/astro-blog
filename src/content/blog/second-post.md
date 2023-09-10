---
title: 'Second post'
description: 'Lorem ipsum dolor sit amet'
pubDate: 'Jul 22 2022'
heroImage: '/images/blog-placeholder-4.jpg'
draft: true
---

I'm going to teach you how to find the _main_ or _primary_ color that exists in any given image. With some bonuses at the end, too!

![Two female monks, sitting on the side of a mountain overlooking the valley at sunrise](https://res.cloudinary.com/simey/image/upload/q_auto/v1668016462/Dev/monks/monks_vqcmqk.jpg)

## Magic(k)al ✨

We'll be using a CLI tool called [**ImageMagick** for this](https://imagemagick.org). You can think of it as _Photoshop in Code._ Below is what we'll be trying to achieve. Taking an input image and extracting a color for our purposes.

![Example picture of Two female monks sitting on the side of a mountain and the primary extracted color from that picture (#305168)](https://res.cloudinary.com/simey/image/upload/v1668016348/Dev/monks/monks-convert_w6xxrl.webp)


### Requirements

For the script to be useful, it will need to hit these requirements;

- Needs to get the _“correct”_ visually-similar color
- It has to _work consistently_ without needing tweaks
- Must _handle any/all image formats_ and color-spaces
- It should be able to run in a batch-process / cronjob

### What's new?

Getting the prominent color from an image has been done before. And there's many other blogs or [articles documenting how to do it](https://www.imagemagick.org/discourse-server/viewtopic.php?t=28963). However I found other examples were too basic to get the _“correct”_ color, and the scripts were not always complete.

---

### Final Code
If you just wish to copy-paste, here's the shell command to get the color from a single image. _Providing you have ImageMagick installed._

```bash
convert {{myImage}}[0] \
    -strip -alpha remove -trim \
    -resize 700x700 -blur 0x7 -modulate 100,120 \
    -dither FloydSteinberg -quantize LAB \
    -colors 4 -colorspace srgb \
    -format %c histogram:info:- | sort -r | head -1 | \
    cut -d '#' -f 2 | cut -c 1-6 | tr '[:upper:]' '[:lower:]'

# replace {{myImage}} with your image's path
```
But if you're curious to learn, or want to know how to use this in a more advanced way... continue reading!

---

### Breakdown

The high-level concept is like so;

1. find the image
2. clean it up for use
3. smooth out color boundaries
4. reduce colors with dithering
5. extract the color data

---

#### Getting Started

```bash
sudo apt install imagemagick
# Before we can use this CLI tool we'll need to install it!
# 'sudo' is only needed if you don't have rights to install

```

Once the tool is installed, we should check it's working correctly.

```bash
convert --version
# or
convert --help
```

As long as one of those commands is giving a sensible output, then we should be good-to-go!




---

#### Cleaning up the image

![](https://res.cloudinary.com/simey/image/upload/q_auto/v1668016462/Dev/monks/monks_vqcmqk.jpg)
<sup>This is the image we will be extracting color from</sup>

  
```bash
convert ./myImage.png[0] -strip -alpha remove -trim 
```
- `convert ./myImage.png[0]` <span style="display: block; margin: 10px 20px 20px; font-size: 0.875em;">
    This tells ImageMagick to load the given file's "first frame" ready for usage. "`convert`" is simply the name of the command-line function. We need to specify the first frame (`[0]`) otherwise the command would fail on `.gif` image sequences.</span >

- `-strip` <span style="display: block; margin: 10px 20px 20px; font-size: 0.875em;">
    Strip will remove all the extraneous metadata for the image.
    </span>
    
- `-alpha remove` <span style="display: block; margin: 10px 20px 20px; font-size: 0.875em;">
    Then we tell ImageMagick to remove the alpha channels from the image because we do not want the primary color if it's transparent, and we do not want semi-transparent pixels getting incorrectly quantized. **_caveat; images with mostly transparent pixels will likely turn out white_**
    </span>

- `-trim` <span style="display: block; margin: 10px 20px 20px; font-size: 0.875em;">
    We then remove any pixels which are the same as the corner, this is helpful for transparent images to try and avoid the white-background issue. This will basically do nothing on most images.
    </span>
    





---

#### Blurring the Details

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1em;">

<p style="margin-top: 10px;">
<img src="https://res.cloudinary.com/simey/image/upload/q_auto/v1668016871/Dev/monks/m-strip-alpha-remove-resize-blur_vchfsp.jpg">
<sup>First the image is resized and blurred</sup>
</p>

<p style="margin-top: 10px;">
<img src="https://res.cloudinary.com/simey/image/upload/q_auto/v1668187693/Dev/monks/m-strip-alpha-remove-resize-blur-modulate_uwuasj.jpg">
<sup>Then we boost the saturation channel by 20%</sup>
</p>

</div>


```bash
convert ./myImage.png[0] \
    -strip -alpha remove -trim \
    -resize 700x700 -blur 0x7 -modulate 100,120
```
- `-resize 700x700` <span style="display: block; margin: 10px 20px 20px; font-size: 0.875em;">
    We first reduce (or scale up) the image to an arbitrary size which is not too large. I found 700 works ok. This is big enough that the blur doesn't do too much damage. `700x700` just means it will scale so it's either 700 wide, or 700 high but will maintain aspect ratio.</span>

- `-blur 0x7` <span style="display: block; margin: 10px 20px 20px; font-size: 0.875em;">
    We blur the image by `0x7`, the first number `0` is the radius (in pixels) and the second number `7` is the sigma. Blurring is important as it averages out the peaks and valleys in the histogram without losing too much of the color nuance.
    </span>
    
- `-modulate 100,120` <span style="display: block; margin: 10px 20px 20px; font-size: 0.875em;">
    Then we need to boost the saturation a bit with `modulate`. This is because when we do the `quantize` in the next steps, we need to use **LAB** colorspace, and LAB has less vibrancy than sRGB.
    </span>
    





---

#### Dithering Algorithm

<p style="margin-top: 10px;">
<img src="https://res.cloudinary.com/simey/image/upload/q_auto/v1668187944/Dev/monks/m-strip-alpha-remove-resize-blur-modulate-dither-quantize_fei0ph.jpg">
<sup>Here's an example of the quantizing dithering at a nominal 32 colors</sup>
</p>


```bash
convert ./myImage.png[0] \
    -strip -alpha remove -trim \
    -resize 700x700 -blur 0x7 -modulate 100,120 \
    -dither FloydSteinberg -quantize LAB \
```
- `-dither FloydSteinberg` <span style="display: block; margin: 10px 20px 20px; font-size: 0.875em;">
    This step doesn't affect the image, but it prepares the algorithm that will be used during `quantize`. We use `FloydSteinberg` as the algorithm as it creates the most natural pattern to the eyes.</span>


<div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1em; place-items: start center; text-align: center; font-size: 0.75em; line-height: 1;">

<img src="https://res.cloudinary.com/simey/image/upload/c_crop,h_300,q_auto,w_140/v1668188200/Dev/monks/m-strip-alpha-remove-resize-blur-modulate-ditherAlt-quantize-colors4_jnu66t.jpg">
<span style="grid-row: 2;">no dither</span >

<img src="https://res.cloudinary.com/simey/image/upload/c_crop,h_300,q_auto,w_140/v1668188201/Dev/monks/m-strip-alpha-remove-resize-blur-modulate-ditherRiemersa-quantize-colors4_nmwwex.jpg">
<span style="grid-row: 2;">Riemersa</span >

<img src="https://res.cloudinary.com/simey/image/upload/c_crop,h_300,q_auto,w_140/v1668187944/Dev/monks/m-strip-alpha-remove-resize-blur-modulate-dither-quantize-colors4_fuldl0.jpg">
<span style="grid-row: 2;">FloydSteinberg</span >

</div>

- `-quantize LAB` <span style="display: block; margin: 10px 20px 20px; font-size: 0.875em;">
    like `-dither`, `-quantize` won't actually do anything at this stage. It's just preparing the algorithm that will be used for reducing the colors. We are using **LAB** color space, as it produces much more realistic color blending.
    </span>
    





---

#### Crunching the Colors


<p style="margin-top: 10px;">
<img src="https://res.cloudinary.com/simey/image/upload/q_auto/v1668187944/Dev/monks/m-strip-alpha-remove-resize-blur-modulate-dither-quantize-colors4-space_r5b5mu.jpg">
<sup>The final image after reducing the colors to 4</sup>
</p>



```bash
convert ./myImage.png[0] \
    -strip -alpha remove -trim \
    -resize 700x700 -blur 0x7 -modulate 100,120 \
    -dither FloydSteinberg -quantize LAB \
    -colors 4 -colorspace srgb \
```
- `-colors 4` <span style="display: block; margin: 10px 20px 20px; font-size: 0.875em;">
    Now that the reduction algorithm has been prepared, we will reduce the total colors in the image down to only 4. We do this so that the image is now averaging out the colors in a pattern that allows us to select just the one that has the highest count of pixels</span>

- `-colorspace srgb` <span style="display: block; margin: 10px 20px 20px; font-size: 0.875em;">
    Because we changed the colorspace to LAB earlier for the quantizing, we need to set it back to sRGB for the final hex extraction, otherwise the RGB values will be off.
    </span>

    





---

#### Histogrammer


<p style="margin-top: 10px;">
<img src="https://res.cloudinary.com/simey/image/upload/q_auto/v1668196796/Dev/monks/histo32_d1s5j4.png">
<sup>Histogram visualization for the 32 quantized image</sup>
</p>


<p style="margin-top: 10px;">
<img src="https://res.cloudinary.com/simey/image/upload/q_auto/v1668196796/Dev/monks/histo4_fe25d8.png">
<sup>We have a clear winner with less colors</sup>
</p>



```bash
convert ./myImage.png[0] \
    -strip -alpha remove -trim \
    -resize 700x700 -blur 0x7 -modulate 100,120 \
    -dither FloydSteinberg -quantize LAB \
    -colors 4 -colorspace srgb \
    -format %c histogram:info:- | sort -r | head -1 | \
    cut -d '#' -f 2 | cut -c 1-6 | tr '[:upper:]' '[:lower:]'
```
- `-colors 4` <span style="display: block; margin: 10px 20px 20px; font-size: 0.875em;">
    Now that the reduction algorithm has been prepared, we will reduce the total colors in the image down to only 4. We do this so that the image is now averaging out the colors in a pattern that allows us to select just the one that has the highest count of pixels</span>

- `-colorspace srgb` <span style="display: block; margin: 10px 20px 20px; font-size: 0.875em;">
    Because we changed the colorspace to LAB earlier for the quantizing, we need to set it back to sRGB for the final hex extraction, otherwise the RGB values will be off.
    </span>


---

 



-format %c histogram:info:- | sort -r | head -1 | \
    cut -d '#' -f 2 | cut -c 1-6 | tr '[:upper:]' '[:lower:]'

