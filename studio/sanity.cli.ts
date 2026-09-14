import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'o8sj69wc',
    dataset: 'production',
  },
  studioHost: 'beams-creative',
  deployment: {
    appId: 'w6we7osavow9okuqhldncnf6',
    autoUpdates: true,
  },
})
