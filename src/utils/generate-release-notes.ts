import { IPullRequest } from '../interfaces/i-pull-request'
import Handlebars from 'handlebars'

export async function generateReleaseNotes(pullRequests: IPullRequest[]) {
  const response = await fetch('/assets/templates/base-template.hbs')
  if (!response.ok) {
    throw new Error(`Failed to load template: ${response.statusText}`)
  }
  const templateContent = await response.text()

  const template = Handlebars.compile(templateContent)

  const data = {
    title: 'Release Notes',
    header: 'Release Notes',
    pullRequests: pullRequests,
  }

  createHtmlFile(template(data))
}

function createHtmlFile(content: string) {
  const blob = new Blob([content], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'release-notes.html'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
