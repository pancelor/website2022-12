## todo

- [x] why is livejs so bad in this setup?
  - [/] lots of "type is null" errors -- what's up?
  -  the browser cache was the problem, along with mimetypes
    - maybe hard refresh if you edit live.js...?
    - or go to network tab and disable caching
- [x] see if papaparse has nice conversion to html table function
- [x] split tags
- [x] tag coloring
- [x] dynamic tags
- [ ] row appear/disappear animations
- [ ] table size jumps during filtering; annoying
- [ ] could do dotted tag outlines instead of grayout maybe
- [ ] row colors are bad
- [ ] ooh multiple tags = multiple layers of highlight, not binary! but, do I want filtering or highlighting?
- [ ] `target="_blank"` on links?
- [ ] itch added `rel="nofollow noopener" referrerpolicy="origin"` to my external links; why?
  to read: https://pointjupiter.com/what-noopener-noreferrer-nofollow-explained/
- [ ] colors being in css instead of inline is awkward b/c now the color info is separate from the descriptions
- [ ] maybe "code" tag should be subset of blog only. code, design, etc
  hierarchy of tags... just in my mind, not in code. stop using medium for blog...?
- [ ] whats the point of collab? to be able to filter out stuff I wasn't the main dev on? it doesn't serve that purpose right now
- [ ] date specificity, like justas?
- [ ] paid tag (not yet)
- [ ] thinky tag?
- [ ] code tag is on too much stuff rn
- [ ] highlight doesn't work on load right now
- [ ] hover over name for picture?
  ooh or website2 noel-style slide in maybe... be sure not to make too much work for yourself tho
- [ ] link at end v. link as the name? might make hover-picture/details pane awkward

## misc notes

palette https://lospec.com/palette-list/indecision

works, apparently:
```css
.js-element:after {
    content: attr(data-count);
}
```

## verbs (link text)

think
ponder
guess
wishlist
play
read

## tags

tags should be for sorting, not for tumblr info-embedding. move after words column?

tags have dif colors for dif categories
e.g. game genre tags are all green, length tags are all purple, etc
able to drag tags into include/exclude/unbiased buckets

### tags to use
hard
easy
best - auto-highlight?
sketch
thinky?
tool
animation?
sizecode?
tiny/small/medium/large

### tags to not use
pico8

### on the edge but not best
mine1k
the detective?
