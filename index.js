const got = require('got')
const cheerio = require('cheerio')
const { createWriteStream } = require('fs')

// probably need some way to let the users choose a gfycat profile to search for.

const gfycatUserName = process.argv.slice(2)[0]

if(!gfycatUserName) return console.log('a script needs a name...')

const gfycatProfileUrl = `https://gfycat.com/@${gfycatUserName}`
// init writeStream
const writeStream = createWriteStream(`./results/${gfycatUserName}.md`)
writeStream.write(`# [${gfycatUserName}](${gfycatProfileUrl})\n\n`)

// bring me the horizon!
got(gfycatProfileUrl)
  .then((response) => {
    const $ = cheerio.load(response.body)

    // for each gif thumbnail-preview on users page
    $('.grid-gfy-item').each(function (i, el) {

      // get link to gif
      const gfyHash = $(el)
        .find('a')
        .attr('href')
        .replace('/gifs/detail/', '')
      const gifLink = `https://gfycat.com/${gfyHash}`
      const gifPreview = `https://thumbs.gfycat.com/${gfyHash}-small.gif`
        
      // get gif title
      const foundTitle = $(el).find('meta[itemprop="name"]').attr('content')
      const gifTitle = foundTitle !== 'undefined' ? foundTitle : 'untitled'
      
      // markdownify
      const title_as_md = `### [${gifTitle}](${gifLink})`
      const preview_as_md = `![${gifTitle}](${gifPreview})`
      
      const markdown = `${title_as_md}\n${preview_as_md}\n`
      writeStream.write(markdown)
    })
    // close the gates!
    writeStream.end()
  })
  .catch(err => console.error('\n\nUH OH\n\n', err))
  
  // i should really know how to talk to the DOM by now
  //https://stackoverflow.com/questions/41193800/select-elements-with-an-attribute-with-cheerio
