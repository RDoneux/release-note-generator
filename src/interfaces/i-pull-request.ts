export interface IPullRequest {
  repository: IPullRequestRepository
  pullRequestId: number
  codeReviewId: number
  status: string
  createdBy: IPullRequestCreatedBy
  creationDate: Date
  closedDate: Date
  title: string
  description: string
  sourceRefName: string
  targetRefName: string
  mergeStatus: string
  isDraft: boolean
  mergeId: string
  url: string
  supportIterations: boolean
  completionQueueTime: Date
}

export interface IPullRequestRepository {
  id: string
  name: string
  url: string
  project: IPullRequestProject
}

export interface IPullRequestProject {
  id: string
  name: string
  state: string
  visibility: string
  lastUpdateTime: Date
}

export interface IPullRequestCreatedBy {
  displayName: string
  url: string
  id: string
  uniqueName: string
  imageUrl: string
  descriptor: string
}
