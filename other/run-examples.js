const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const examplesFolder = 'packages/data-point/examples/'

fs.readdir(examplesFolder, (err, files) => {
  if (err) {
    console.log(err)
    return
  }

  console.log(`Executing all examples in ${examplesFolder}`)

  files.forEach(file => {
    const filename = examplesFolder + file
    exec(`node ${path.resolve(filename)}`, (err, stdout, stderr) => {
      if (err) {
        console.error(err)
        return
      }

      if (stdout) {
        console.log(`stdout from ${filename}:\n${stdout}`)
      }

      if (stderr) {
        console.error(`stderr from ${filename}:\n${stderr}`)
      }
    })
  })
})
