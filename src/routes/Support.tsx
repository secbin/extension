import { ExternalLink, MessageCircle, Bug, GitPullRequest, Heart } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import SettingsRow from '@/components/common/SettingsRow'

const links = {
  faq: 'https://securebin.org/support/',
  bug: 'https://github.com/secbin/extension/issues/new',
  contribute: 'https://github.com/secbin/extension/pulls',
  donate: 'https://securebin.org/donate/',
}

function openExternal(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

export default function Support() {
  return (
    <div>
      <PageHeader title="Help & Support" />

      <div className="divide-y divide-border">
        <div className="py-1">
          <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            Support
          </p>
          <SettingsRow
            label="FAQs"
            description="Common questions answered"
            onClick={() => openExternal(links.faq)}
            chevron
          >
            <MessageCircle size={16} className="text-text-muted" />
          </SettingsRow>
          <SettingsRow
            label="Report a Bug"
            description="Open an issue on GitHub"
            onClick={() => openExternal(links.bug)}
            chevron
          >
            <Bug size={16} className="text-text-muted" />
          </SettingsRow>
        </div>

        <div className="py-1">
          <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            Contribute
          </p>
          <SettingsRow
            label="Contribute Code"
            description="Submit a pull request"
            onClick={() => openExternal(links.contribute)}
            chevron
          >
            <GitPullRequest size={16} className="text-text-muted" />
          </SettingsRow>
          <SettingsRow
            label="Donate"
            description="Support the project"
            onClick={() => openExternal(links.donate)}
            chevron
          >
            <Heart size={16} className="text-text-muted" />
          </SettingsRow>
        </div>
      </div>
    </div>
  )
}
