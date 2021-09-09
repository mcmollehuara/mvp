'use strict'
const yeoman = require('yeoman-generator')
const chalk = require('chalk')
const yosay = require('yosay')
const path = require('path')
const wiring = require('html-wiring')
const pathExists = require('path-exists')

const bePath = 'ui.apps/src/main/content/jcr_root/apps/mvp/components/'
const beRelativePath = 'mvp/components/'
const beAtoms = 'content/atoms/'
const groupName = 'mvp.atoms'
const beModelPath = 'core/src/main/java/com/mvp/aem/core/models/'
const beModelImplPath = beModelPath + 'impl/'
const reactPath = 'ui.frontend/src/main/webpack/components/'
const reactImportPath = reactPath + 'import-components.js'
const reactExportPath = reactPath + 'export-components.js'
const sassMainPath = reactPath + 'component-index.scss'
const jsMainPath = reactPath + 'component-index.js'

const reactComponentSubDir = 'content/'

module.exports = class extends yeoman {
  initializing () {
    if (!pathExists.sync(reactPath)) {
      this.env.error('ERROR: Are you running this command from the right location? Could not find ' + jsMainPath)
    }
    if (!pathExists.sync(sassMainPath)) {
      this.env.error('ERROR: Are you running this command from the right location? Could not find ' + sassMainPath)
    }
  }

  prompting () {
    const done = this.async()

    this.log(yosay(
      'Welcome to the ' + chalk.red('AEM Component') + ' generator! \nI create stub files for new AEM components.'
    ))

    const prompts = [{
      type: 'input',
      name: 'componentNameDashed',
      message: 'What is the name of the component (with-dashes-all-lowercase)?',
      validate: function (componentNameDashed) {
        if (!/^[a-z-]+$/.exec(componentNameDashed)) {
          return 'Invalid name [' + componentNameDashed + '], all lowercase and dashes.'
        }
        return true
      }
    }]

    this.prompt(prompts).then(function (props) {
      this.props = props

      this.props.modeSet = new Set(['sass', 'js', 'xml', 'java'])

      this.log(chalk.cyan('Will use the the following configurations:'))

      this.props.componentNameCamel = this.props.componentNameDashed
        .replace(/-([\w])/g, (m, p1) => `${p1.toUpperCase()}`)
      this.log('componentNameCamel:\t' + chalk.blue(this.props.componentNameCamel))

      this.props.prettyName = this.props.componentNameDashed
        .replace(/(?:^|-)(\w)/g, (m, p1, offset) => `${offset > 0 ? ' ' : ''}${p1.toUpperCase()}`)
      this.log('prettyName:\t\t' + chalk.blue(this.props.prettyName))

      this.props.folderName = this.props.componentNameDashed
      this.log('folderName:\t\t' + chalk.blue(this.props.folderName))

      this.props.backendRelativePath = beRelativePath + beAtoms
      this.props.backendComponentGroupName = groupName

      this.props.className = 'cmp-' + this.props.componentNameDashed
      this.log('className:\t\t' + chalk.blue(this.props.className))

      if (this.props.modeSet.has('sass')) {
        this.props.sassFileName = this.props.componentNameDashed
        this.log('sassFileName:\t\t' + chalk.blue(this.props.sassFileName))
      }

      if (this.props.modeSet.has('js')) {
        this.props.jsModuleName = this.props.componentNameDashed
        this.props.jsObjectName = capitalizeFirstLetter(this.props.componentNameCamel)
        this.props.jsFileName = this.props.componentNameDashed
        this.log('jsModuleName:\t\t' + chalk.blue(this.props.jsModuleName))
        this.log('jsObjectName:\t\t' + chalk.blue(this.props.jsObjectName))
        this.log('jsFileName:\t\t' + chalk.blue(this.props.jsFileName))
      }

      // Final confirmation prompt
      this.prompt([{
        type: 'confirm',
        name: 'continue',
        default: false,
        message: 'Does this look correct?'
      }]).then(function (props) {
        if (!props.continue) {
          this.log(chalk.yellow('Exiting: Please re-run with correct inputs.'))
          process.exit(1)
        }
        done()
      }.bind(this))
    }.bind(this))
  }

  writing () {
    /*
     * SASS FILES
     */

    if (this.props.modeSet.has('sass')) {
      this.fs.copyTpl(
        this.templatePath('componentSass.scss'),
        this.destinationPath(path.join(reactPath, reactComponentSubDir, this.props.jsObjectName, this.props.sassFileName + '.scss')),
        this.props
      )

      // UPDATE SASS INDEX FILE
      const sassToAdd = '@import "' + path.join(reactComponentSubDir, this.props.jsObjectName, this.props.sassFileName) + '";\n'
      let sassContent = wiring.readFileAsString(sassMainPath)
      if (!sassContent.includes(sassToAdd)) {
        this.log(chalk.yellow('Updating ') + sassMainPath)

        sassContent = sassContent + sassToAdd
        wiring.writeFileFromString(sassContent, sassMainPath)
      } else {
        this.log(chalk.cyan('Skipping ') + sassMainPath + ' update')
      }
    }

    /*
     * React FILES import
     */
    if (this.props.modeSet.has('js')) {
      this.fs.copyTpl(
        this.templatePath('componentReact.js'),
        this.destinationPath(path.join(reactPath, reactComponentSubDir, this.props.jsObjectName, this.props.jsObjectName + '.js')),
        this.props
      )

      // UPDATE REACT INDEX FILE
      const jsToAdd = 'import \'./' + reactComponentSubDir + this.props.jsObjectName + '/' + this.props.jsObjectName + '\'\n'
      let jsContent = wiring.readFileAsString(reactImportPath)

      if (!jsContent.includes(jsToAdd)) {
        this.log(chalk.yellow('Updating ') + reactImportPath)

        jsContent = jsContent + jsToAdd
        wiring.writeFileFromString(jsContent, reactImportPath)
      } else {
        this.log(chalk.cyan('Skipping ') + reactImportPath + ' update')
      }

      // React files export
      let hook = '/* ===== yeoman hook 1 ===== */'
      let tempPath = reactExportPath
      let file = wiring.readFileAsString(tempPath)
      let insert = 'import ' + this.props.jsObjectName + ' from ' + '\'./' + reactComponentSubDir + this.props.jsObjectName + '/' + this.props.jsObjectName + '\'\n'

      if (file.indexOf(insert) === -1) {
        wiring.writeFileFromString(file.replace(hook, insert + hook), tempPath)
      }

      hook = '/* ===== yeoman hook 2 ===== */'
      tempPath = reactExportPath
      file = wiring.readFileAsString(tempPath)
      insert = ',\n  ' + this.props.jsObjectName

      if (file.indexOf(insert) === -1) {
        wiring.writeFileFromString(file.replace(hook, insert + hook), tempPath)
      }

      this.log(chalk.yellow('Updating ') + reactExportPath)

      if (!jsContent.includes(jsToAdd)) {
        this.log(chalk.yellow('Updating ') + reactExportPath)
      } else {
        this.log(chalk.cyan('Skipping ') + reactExportPath + ' update')
      }
    }

    /*
     * XML FILES
     */
    if (this.props.modeSet.has('xml')) {
      this.fs.copyTpl(
        this.templatePath('_cq_dialog.xml'),
        this.destinationPath(path.join(bePath, beAtoms, this.props.folderName, '_cq_dialog', '.content.xml')),
        this.props
      )
      this.fs.copyTpl(
        this.templatePath('.content.xml'),
        this.destinationPath(path.join(bePath, beAtoms, this.props.folderName, '.content.xml')),
        this.props
      )
    }

    /*
     * JAVA FILES
     */
    if (this.props.modeSet.has('java')) {
      this.fs.copyTpl(
        this.templatePath('ComponentModel.java'),
        this.destinationPath(path.join(beModelPath, this.props.jsObjectName + '.java')),
        this.props
      )
      this.fs.copyTpl(
        this.templatePath('ComponentModelImpl.java'),
        this.destinationPath(path.join(beModelImplPath, this.props.jsObjectName + 'Impl.java')),
        this.props
      )
    }
  }
}

/*
 * START HELPER FUNCTIONS
 */

const capitalizeFirstLetter = string => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
