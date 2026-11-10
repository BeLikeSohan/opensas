import type { HoldStatus } from '../types';
import { APPLICATION_TABS, type ApplicationTabKey } from '../utils/applicationTabs';
import { toBanglaNumber } from '../utils/format';

interface ApplicationTabsProps {
  statuses: HoldStatus[];
  active: ApplicationTabKey;
  onChange: (key: ApplicationTabKey) => void;
}

function ApplicationTabs({ statuses, active, onChange }: ApplicationTabsProps) {
  return (
    <div className="tabs" role="tablist" aria-label="আবেদন ছাঁকুন">
      {APPLICATION_TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={tab.key === active}
          onClick={() => onChange(tab.key)}
        >
          {tab.label} <span className="count">{toBanglaNumber(statuses.filter(tab.match).length)}</span>
        </button>
      ))}
    </div>
  );
}

export default ApplicationTabs;
