type Lang = 'en' | 'hi';

const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Sidebar
    'sidebar.newChat': 'New chat',
    'sidebar.search': 'Search',
    'sidebar.customize': 'Customize',
    'sidebar.chats': 'Chats',
    'sidebar.projects': 'Projects',
    'sidebar.artifacts': 'Artifacts',
    'sidebar.code': 'Code',
    'sidebar.recents': 'Recents',
    'sidebar.categories': 'Categories',
    'sidebar.freePlan': 'Free plan',

    // Topics
    'topic.esg': 'ESG',
    'topic.election': 'Election Caffe',
    'topic.workforce': 'Workforce Intelligence',
    'topic.datacaffe': 'DataCaffe',
    'topic.insurance': 'Insurance',

    // Welcome
    'welcome.greeting': 'Back at it, {name}',
    'welcome.placeholder': 'Type / for skills',

    // Chat
    'chat.replyPlaceholder': 'Reply to AICaffe...',
    'chat.copy': 'Copy',
    'chat.edit': 'Edit',
    'chat.retry': 'Retry',
    'chat.cancel': 'Cancel',
    'chat.send': 'Send',

    // Profile menu
    'menu.settings': 'Settings',
    'menu.language': 'Language',
    'menu.langEnglish': 'English (United States)',
    'menu.langHindi': '\u0939\u093F\u0928\u094D\u0926\u0940 (\u092D\u093E\u0930\u0924)',
    'menu.getHelp': 'Get help',
    'menu.upgradePlan': 'Upgrade plan',
    'menu.logout': 'Log out',

    // Dates
    'date.today': 'Today',
    'date.yesterday': 'Yesterday',
    'date.pastWeek': 'Past week',
    'date.pastMonth': 'Past month',
    'date.justNow': 'just now',
    'date.minuteAgo': '{n} minute ago',
    'date.minutesAgo': '{n} minutes ago',
    'date.hourAgo': '{n} hour ago',
    'date.hoursAgo': '{n} hours ago',
    'date.dayAgo': '{n} day ago',
    'date.daysAgo': '{n} days ago',
    'date.monthAgo': '{n} month ago',
    'date.monthsAgo': '{n} months ago',

    // Settings
    'settings.title': 'Settings',
    'settings.tab.general': 'General',
    'settings.tab.account': 'Account',
    'settings.tab.privacy': 'Privacy',
    'settings.tab.billing': 'Billing',
    'settings.profile': 'Profile',
    'settings.fullName': 'Full name',
    'settings.callName': 'What should AICaffe call you?',
    'settings.workDesc': 'What best describes your work?',
    'settings.selectWork': 'Select your work function',
    'settings.preferencesLabel': 'What personal preferences should AICaffe consider in responses?',
    'settings.preferencesHint': "Your preferences will apply to all conversations, within AICaffe's guidelines.",
    'settings.preferencesPlaceholder': 'e.g. when learning new concepts, I find analogies particularly helpful',
    'settings.notifications': 'Notifications',
    'settings.responseCompletions': 'Response completions',
    'settings.responseCompletionsDesc': 'Get notified when AICaffe has finished a response. Most useful for long-running tasks like tool calls and Research.',
    'settings.appearance': 'Appearance',
    'settings.colorMode': 'Color mode',
    'settings.colorLight': 'Light',
    'settings.colorAuto': 'Auto',
    'settings.colorDark': 'Dark',
    'settings.cancel': 'Cancel',
    'settings.saveChanges': 'Save changes',
    'settings.saving': 'Saving...',
    'settings.savedSuccess': 'Settings saved successfully',
    'settings.savedError': 'Failed to save settings',
    'settings.networkError': 'Network error. Please try again.',

    // Account
    'account.title': 'Account',
    'account.logoutAll': 'Log out of all devices',
    'account.logoutBtn': 'Log out',
    'account.deleteAccount': 'Delete account',
    'account.contactSupport': 'Contact support',
    'account.orgId': 'Organization ID',
    'account.activeSessions': 'Active sessions',
    'account.loadingSessions': 'Loading sessions...',
    'account.noSessions': 'No active sessions found.',
    'account.device': 'Device',
    'account.location': 'Location',
    'account.created': 'Created',
    'account.updated': 'Updated',
    'account.current': 'Current',

    // Privacy
    'privacy.title': 'Privacy',
    'privacy.subtitle': 'AICaffe believes in transparent data practices',
    'privacy.desc': 'Learn how your information is protected when using AICaffe products, and visit our',
    'privacy.descAnd': 'and',
    'privacy.descEnd': 'for more details.',
    'privacy.privacyCenter': 'Privacy Center',
    'privacy.privacyPolicy': 'Privacy Policy',
    'privacy.howProtect': 'How we protect your data',
    'privacy.howUse': 'How we use your data',
    'privacy.settingsTitle': 'Privacy settings',
    'privacy.exportData': 'Export data',
    'privacy.sharedChats': 'Shared chats',
    'privacy.manage': 'Manage',

    // Billing
    'billing.title': 'Billing',
    'billing.freePlan': 'You are currently on the Free plan.',

    // Projects
    'projects.title': 'Projects',
    'projects.newProject': 'New project',
    'projects.searchPlaceholder': 'Search projects...',
    'projects.sortBy': 'Sort by',
    'projects.activity': 'Activity',
    'projects.created': 'Created',
    'projects.loading': 'Loading projects...',
    'projects.noMatch': 'No projects match your search.',
    'projects.empty': 'No projects yet. Create your first project!',
    'projects.updated': 'Updated {date}',
    'projects.back': 'Back',
    'projects.allProjects': 'All projects',
    'projects.createTitle': 'Create new project',
    'projects.projectName': 'Project name',
    'projects.projectNamePlaceholder': 'My project',
    'projects.descriptionLabel': 'Description (optional)',
    'projects.descriptionPlaceholder': 'What is this project about?',
    'projects.creating': 'Creating...',
    'projects.createProject': 'Create project',
    'projects.share': 'Share',
    'projects.editTitle': 'Edit project',
    'projects.noConversations': 'No conversations yet. Start chatting above!',
    'projects.lastMessage': 'Last message {date}',
    'projects.chatPlaceholder': 'How can I help you today?',
    'projects.replyPlaceholder': 'Reply...',

    // Upgrade
    'upgrade.title': 'Plans that grow with you',
    'upgrade.individual': 'Individual',
    'upgrade.teamEnterprise': 'Team and Enterprise',
    'upgrade.disclaimer': "*Usage limits apply. Prices shown don't include applicable tax.",

    // Search
    'search.placeholder': 'Search chats and projects',
    'search.loading': 'Loading...',
    'search.noResults': 'No results found',
  },

  hi: {
    // Sidebar
    'sidebar.newChat': '\u0928\u0908 \u091A\u0948\u091F',
    'sidebar.search': '\u0916\u094B\u091C\u0947\u0902',
    'sidebar.customize': '\u0905\u0928\u0941\u0915\u0942\u0932\u093F\u0924 \u0915\u0930\u0947\u0902',
    'sidebar.chats': '\u091A\u0948\u091F\u094D\u0938',
    'sidebar.projects': '\u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F\u094D\u0938',
    'sidebar.artifacts': '\u0906\u0930\u094D\u091F\u093F\u092B\u0948\u0915\u094D\u091F\u094D\u0938',
    'sidebar.code': '\u0915\u094B\u0921',
    'sidebar.recents': '\u0939\u093E\u0932 \u0915\u0947',
    'sidebar.categories': '\u0936\u094D\u0930\u0947\u0923\u093F\u092F\u093E\u0901',
    'sidebar.freePlan': '\u092E\u0941\u092B\u094D\u0924 \u092F\u094B\u091C\u0928\u093E',

    // Topics
    'topic.esg': 'ESG',
    'topic.election': '\u091A\u0941\u0928\u093E\u0935 \u0915\u0948\u092B\u0947',
    'topic.workforce': '\u0915\u093E\u0930\u094D\u092F\u092C\u0932 \u0907\u0902\u091F\u0947\u0932\u093F\u091C\u0947\u0902\u0938',
    'topic.datacaffe': '\u0921\u0947\u091F\u093E\u0915\u0948\u092B\u0947',
    'topic.insurance': '\u092C\u0940\u092E\u093E',

    // Welcome
    'welcome.greeting': '\u092B\u093F\u0930 \u0938\u0947 \u0938\u094D\u0935\u093E\u0917\u0924, {name}',
    'welcome.placeholder': '\u0915\u094C\u0936\u0932 \u0915\u0947 \u0932\u093F\u090F / \u091F\u093E\u0907\u092A \u0915\u0930\u0947\u0902',

    // Chat
    'chat.replyPlaceholder': 'AICaffe \u0915\u094B \u091C\u0935\u093E\u092C \u0926\u0947\u0902...',
    'chat.copy': '\u0915\u0949\u092A\u0940 \u0915\u0930\u0947\u0902',
    'chat.edit': '\u0938\u0902\u092A\u093E\u0926\u093F\u0924 \u0915\u0930\u0947\u0902',
    'chat.retry': '\u092A\u0941\u0928\u0903 \u092A\u094D\u0930\u092F\u093E\u0938',
    'chat.cancel': '\u0930\u0926\u094D\u0926 \u0915\u0930\u0947\u0902',
    'chat.send': '\u092D\u0947\u091C\u0947\u0902',

    // Profile menu
    'menu.settings': '\u0938\u0947\u091F\u093F\u0902\u0917\u094D\u0938',
    'menu.language': '\u092D\u093E\u0937\u093E',
    'menu.langEnglish': 'English (United States)',
    'menu.langHindi': '\u0939\u093F\u0928\u094D\u0926\u0940 (\u092D\u093E\u0930\u0924)',
    'menu.getHelp': '\u0938\u0939\u093E\u092F\u0924\u093E \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0915\u0930\u0947\u0902',
    'menu.upgradePlan': '\u092F\u094B\u091C\u0928\u093E \u0905\u092A\u0917\u094D\u0930\u0947\u0921 \u0915\u0930\u0947\u0902',
    'menu.logout': '\u0932\u0949\u0917 \u0906\u0909\u091F',

    // Dates
    'date.today': '\u0906\u091C',
    'date.yesterday': '\u0915\u0932',
    'date.pastWeek': '\u092A\u093F\u091B\u0932\u0947 \u0938\u092A\u094D\u0924\u093E\u0939',
    'date.pastMonth': '\u092A\u093F\u091B\u0932\u0947 \u092E\u0939\u0940\u0928\u0947',
    'date.justNow': '\u0905\u092D\u0940',
    'date.minuteAgo': '{n} \u092E\u093F\u0928\u091F \u092A\u0939\u0932\u0947',
    'date.minutesAgo': '{n} \u092E\u093F\u0928\u091F \u092A\u0939\u0932\u0947',
    'date.hourAgo': '{n} \u0918\u0902\u091F\u093E \u092A\u0939\u0932\u0947',
    'date.hoursAgo': '{n} \u0918\u0902\u091F\u0947 \u092A\u0939\u0932\u0947',
    'date.dayAgo': '{n} \u0926\u093F\u0928 \u092A\u0939\u0932\u0947',
    'date.daysAgo': '{n} \u0926\u093F\u0928 \u092A\u0939\u0932\u0947',
    'date.monthAgo': '{n} \u092E\u0939\u0940\u0928\u093E \u092A\u0939\u0932\u0947',
    'date.monthsAgo': '{n} \u092E\u0939\u0940\u0928\u0947 \u092A\u0939\u0932\u0947',

    // Settings
    'settings.title': '\u0938\u0947\u091F\u093F\u0902\u0917\u094D\u0938',
    'settings.tab.general': '\u0938\u093E\u092E\u093E\u0928\u094D\u092F',
    'settings.tab.account': '\u0916\u093E\u0924\u093E',
    'settings.tab.privacy': '\u0917\u094B\u092A\u0928\u0940\u092F\u0924\u093E',
    'settings.tab.billing': '\u092C\u093F\u0932\u093F\u0902\u0917',
    'settings.profile': '\u092A\u094D\u0930\u094B\u092B\u093C\u093E\u0907\u0932',
    'settings.fullName': '\u092A\u0942\u0930\u093E \u0928\u093E\u092E',
    'settings.callName': 'AICaffe \u0906\u092A\u0915\u094B \u0915\u094D\u092F\u093E \u092C\u0941\u0932\u093E\u090F?',
    'settings.workDesc': '\u0906\u092A\u0915\u0947 \u0915\u093E\u092E \u0915\u093E \u0938\u092C\u0938\u0947 \u0905\u091A\u094D\u091B\u093E \u0935\u0930\u094D\u0923\u0928 \u0915\u094D\u092F\u093E \u0939\u0948?',
    'settings.selectWork': '\u0905\u092A\u0928\u093E \u0915\u093E\u0930\u094D\u092F \u091A\u0941\u0928\u0947\u0902',
    'settings.preferencesLabel': 'AICaffe \u0915\u094B \u091C\u0935\u093E\u092C\u094B\u0902 \u092E\u0947\u0902 \u0915\u094C\u0928 \u0938\u0940 \u0935\u094D\u092F\u0915\u094D\u0924\u093F\u0917\u0924 \u092A\u094D\u0930\u093E\u0925\u092E\u093F\u0915\u0924\u093E\u090F\u0901 \u0927\u094D\u092F\u093E\u0928 \u092E\u0947\u0902 \u0930\u0916\u0928\u0940 \u091A\u093E\u0939\u093F\u090F?',
    'settings.preferencesHint': '\u0906\u092A\u0915\u0940 \u092A\u094D\u0930\u093E\u0925\u092E\u093F\u0915\u0924\u093E\u090F\u0901 AICaffe \u0915\u0947 \u0926\u093F\u0936\u093E\u0928\u093F\u0930\u094D\u0926\u0947\u0936\u094B\u0902 \u0915\u0947 \u0905\u0928\u0941\u0938\u093E\u0930 \u0938\u092D\u0940 \u0935\u093E\u0930\u094D\u0924\u093E\u0932\u093E\u092A\u094B\u0902 \u092A\u0930 \u0932\u093E\u0917\u0942 \u0939\u094B\u0902\u0917\u0940\u0964',
    'settings.preferencesPlaceholder': '\u0909\u0926\u093E. \u0928\u0908 \u0905\u0935\u0927\u093E\u0930\u0923\u093E\u090F\u0901 \u0938\u0940\u0916\u0924\u0947 \u0938\u092E\u092F, \u092E\u0941\u091D\u0947 \u0909\u092A\u092E\u093E\u090F\u0901 \u0935\u093F\u0936\u0947\u0937 \u0930\u0942\u092A \u0938\u0947 \u0938\u0939\u093E\u092F\u0915 \u0932\u0917\u0924\u0940 \u0939\u0948\u0902',
    'settings.notifications': '\u0938\u0942\u091A\u0928\u093E\u090F\u0901',
    'settings.responseCompletions': '\u092A\u094D\u0930\u0924\u093F\u0915\u094D\u0930\u093F\u092F\u093E \u092A\u0942\u0930\u094D\u0923\u0924\u093E',
    'settings.responseCompletionsDesc': 'AICaffe \u091C\u092C \u092A\u094D\u0930\u0924\u093F\u0915\u094D\u0930\u093F\u092F\u093E \u092A\u0942\u0930\u0940 \u0915\u0930 \u0932\u0947 \u0924\u092C \u0938\u0942\u091A\u0928\u093E \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0915\u0930\u0947\u0902\u0964',
    'settings.appearance': '\u0926\u093F\u0916\u093E\u0935\u091F',
    'settings.colorMode': '\u0930\u0902\u0917 \u092E\u094B\u0921',
    'settings.colorLight': '\u0939\u0932\u094D\u0915\u093E',
    'settings.colorAuto': '\u0911\u091F\u094B',
    'settings.colorDark': '\u0917\u0939\u0930\u093E',
    'settings.cancel': '\u0930\u0926\u094D\u0926 \u0915\u0930\u0947\u0902',
    'settings.saveChanges': '\u092A\u0930\u093F\u0935\u0930\u094D\u0924\u0928 \u0938\u0939\u0947\u091C\u0947\u0902',
    'settings.saving': '\u0938\u0939\u0947\u091C \u0930\u0939\u093E \u0939\u0948...',
    'settings.savedSuccess': '\u0938\u0947\u091F\u093F\u0902\u0917\u094D\u0938 \u0938\u092B\u0932\u0924\u093E\u092A\u0942\u0930\u094D\u0935\u0915 \u0938\u0939\u0947\u091C\u0940 \u0917\u0908\u0902',
    'settings.savedError': '\u0938\u0947\u091F\u093F\u0902\u0917\u094D\u0938 \u0938\u0939\u0947\u091C\u0928\u0947 \u092E\u0947\u0902 \u0935\u093F\u092B\u0932',
    'settings.networkError': '\u0928\u0947\u091F\u0935\u0930\u094D\u0915 \u0924\u094D\u0930\u0941\u091F\u093F\u0964 \u092A\u0941\u0928\u0903 \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0947\u0902\u0964',

    // Account
    'account.title': '\u0916\u093E\u0924\u093E',
    'account.logoutAll': '\u0938\u092D\u0940 \u0921\u093F\u0935\u093E\u0907\u0938\u094B\u0902 \u0938\u0947 \u0932\u0949\u0917 \u0906\u0909\u091F \u0915\u0930\u0947\u0902',
    'account.logoutBtn': '\u0932\u0949\u0917 \u0906\u0909\u091F',
    'account.deleteAccount': '\u0916\u093E\u0924\u093E \u0939\u091F\u093E\u090F\u0902',
    'account.contactSupport': '\u0938\u0939\u093E\u092F\u0924\u093E \u0938\u0947 \u0938\u0902\u092A\u0930\u094D\u0915 \u0915\u0930\u0947\u0902',
    'account.orgId': '\u0938\u0902\u0917\u0920\u0928 ID',
    'account.activeSessions': '\u0938\u0915\u094D\u0930\u093F\u092F \u0938\u0924\u094D\u0930',
    'account.loadingSessions': '\u0938\u0924\u094D\u0930 \u0932\u094B\u0921 \u0939\u094B \u0930\u0939\u0947 \u0939\u0948\u0902...',
    'account.noSessions': '\u0915\u094B\u0908 \u0938\u0915\u094D\u0930\u093F\u092F \u0938\u0924\u094D\u0930 \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964',
    'account.device': '\u0921\u093F\u0935\u093E\u0907\u0938',
    'account.location': '\u0938\u094D\u0925\u093E\u0928',
    'account.created': '\u092C\u0928\u093E\u092F\u093E \u0917\u092F\u093E',
    'account.updated': '\u0905\u092A\u0921\u0947\u091F \u0915\u093F\u092F\u093E',
    'account.current': '\u0935\u0930\u094D\u0924\u092E\u093E\u0928',

    // Privacy
    'privacy.title': '\u0917\u094B\u092A\u0928\u0940\u092F\u0924\u093E',
    'privacy.subtitle': 'AICaffe \u092A\u093E\u0930\u0926\u0930\u094D\u0936\u0940 \u0921\u0947\u091F\u093E \u092A\u094D\u0930\u0925\u093E\u0913\u0902 \u092E\u0947\u0902 \u0935\u093F\u0936\u094D\u0935\u093E\u0938 \u0915\u0930\u0924\u093E \u0939\u0948',
    'privacy.desc': 'AICaffe \u0909\u0924\u094D\u092A\u093E\u0926\u094B\u0902 \u0915\u093E \u0909\u092A\u092F\u094B\u0917 \u0915\u0930\u0924\u0947 \u0938\u092E\u092F \u0906\u092A\u0915\u0940 \u091C\u093E\u0928\u0915\u093E\u0930\u0940 \u0915\u0948\u0938\u0947 \u0938\u0941\u0930\u0915\u094D\u0937\u093F\u0924 \u0939\u0948, \u091C\u093E\u0928\u0947\u0902\u0964 \u0939\u092E\u093E\u0930\u0947',
    'privacy.descAnd': '\u0914\u0930',
    'privacy.descEnd': '\u092A\u0930 \u091C\u093E\u090F\u0902\u0964',
    'privacy.privacyCenter': '\u0917\u094B\u092A\u0928\u0940\u092F\u0924\u093E \u0915\u0947\u0902\u0926\u094D\u0930',
    'privacy.privacyPolicy': '\u0917\u094B\u092A\u0928\u0940\u092F\u0924\u093E \u0928\u0940\u0924\u093F',
    'privacy.howProtect': '\u0939\u092E \u0906\u092A\u0915\u0947 \u0921\u0947\u091F\u093E \u0915\u0940 \u0938\u0941\u0930\u0915\u094D\u0937\u093E \u0915\u0948\u0938\u0947 \u0915\u0930\u0924\u0947 \u0939\u0948\u0902',
    'privacy.howUse': '\u0939\u092E \u0906\u092A\u0915\u0947 \u0921\u0947\u091F\u093E \u0915\u093E \u0909\u092A\u092F\u094B\u0917 \u0915\u0948\u0938\u0947 \u0915\u0930\u0924\u0947 \u0939\u0948\u0902',
    'privacy.settingsTitle': '\u0917\u094B\u092A\u0928\u0940\u092F\u0924\u093E \u0938\u0947\u091F\u093F\u0902\u0917\u094D\u0938',
    'privacy.exportData': '\u0921\u0947\u091F\u093E \u0928\u093F\u0930\u094D\u092F\u093E\u0924 \u0915\u0930\u0947\u0902',
    'privacy.sharedChats': '\u0938\u093E\u091D\u093E \u091A\u0948\u091F',
    'privacy.manage': '\u092A\u094D\u0930\u092C\u0902\u0927\u093F\u0924 \u0915\u0930\u0947\u0902',

    // Billing
    'billing.title': '\u092C\u093F\u0932\u093F\u0902\u0917',
    'billing.freePlan': '\u0906\u092A \u0935\u0930\u094D\u0924\u092E\u093E\u0928 \u092E\u0947\u0902 \u092E\u0941\u092B\u094D\u0924 \u092F\u094B\u091C\u0928\u093E \u092A\u0930 \u0939\u0948\u0902\u0964',

    // Projects
    'projects.title': '\u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F\u094D\u0938',
    'projects.newProject': '\u0928\u092F\u093E \u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F',
    'projects.searchPlaceholder': '\u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F \u0916\u094B\u091C\u0947\u0902...',
    'projects.sortBy': '\u0915\u094D\u0930\u092E\u092C\u0926\u094D\u0927',
    'projects.activity': '\u0917\u0924\u093F\u0935\u093F\u0927\u093F',
    'projects.created': '\u092C\u0928\u093E\u092F\u093E \u0917\u092F\u093E',
    'projects.loading': '\u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F \u0932\u094B\u0921 \u0939\u094B \u0930\u0939\u0947 \u0939\u0948\u0902...',
    'projects.noMatch': '\u0915\u094B\u0908 \u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E\u0964',
    'projects.empty': '\u0905\u092D\u0940 \u0924\u0915 \u0915\u094B\u0908 \u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F \u0928\u0939\u0940\u0902\u0964 \u0905\u092A\u0928\u093E \u092A\u0939\u0932\u093E \u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F \u092C\u0928\u093E\u090F\u0902!',
    'projects.updated': '{date} \u092A\u0939\u0932\u0947 \u0905\u092A\u0921\u0947\u091F \u0915\u093F\u092F\u093E',
    'projects.back': '\u0935\u093E\u092A\u0938',
    'projects.allProjects': '\u0938\u092D\u0940 \u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F',
    'projects.createTitle': '\u0928\u092F\u093E \u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F \u092C\u0928\u093E\u090F\u0902',
    'projects.projectName': '\u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F \u0915\u093E \u0928\u093E\u092E',
    'projects.projectNamePlaceholder': '\u092E\u0947\u0930\u093E \u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F',
    'projects.descriptionLabel': '\u0935\u093F\u0935\u0930\u0923 (\u0935\u0948\u0915\u0932\u094D\u092A\u093F\u0915)',
    'projects.descriptionPlaceholder': '\u092F\u0939 \u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F \u0915\u093F\u0938 \u092C\u093E\u0930\u0947 \u092E\u0947\u0902 \u0939\u0948?',
    'projects.creating': '\u092C\u0928\u093E \u0930\u0939\u093E \u0939\u0948...',
    'projects.createProject': '\u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F \u092C\u0928\u093E\u090F\u0902',
    'projects.share': '\u0938\u093E\u091D\u093E \u0915\u0930\u0947\u0902',
    'projects.editTitle': '\u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F \u0938\u0902\u092A\u093E\u0926\u093F\u0924 \u0915\u0930\u0947\u0902',
    'projects.noConversations': '\u0905\u092D\u0940 \u0924\u0915 \u0915\u094B\u0908 \u0935\u093E\u0930\u094D\u0924\u093E\u0932\u093E\u092A \u0928\u0939\u0940\u0902\u0964 \u090A\u092A\u0930 \u091A\u0948\u091F \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902!',
    'projects.lastMessage': '\u0906\u0916\u093F\u0930\u0940 \u0938\u0902\u0926\u0947\u0936 {date}',
    'projects.chatPlaceholder': '\u0906\u091C \u092E\u0948\u0902 \u0906\u092A\u0915\u0940 \u0915\u0948\u0938\u0947 \u092E\u0926\u0926 \u0915\u0930 \u0938\u0915\u0924\u093E \u0939\u0942\u0901?',
    'projects.replyPlaceholder': '\u091C\u0935\u093E\u092C \u0926\u0947\u0902...',

    // Upgrade
    'upgrade.title': '\u0906\u092A\u0915\u0947 \u0938\u093E\u0925 \u092C\u0922\u093C\u0928\u0947 \u0935\u093E\u0932\u0940 \u092F\u094B\u091C\u0928\u093E\u090F\u0901',
    'upgrade.individual': '\u0935\u094D\u092F\u0915\u094D\u0924\u093F\u0917\u0924',
    'upgrade.teamEnterprise': '\u091F\u0940\u092E \u0914\u0930 \u090F\u0902\u091F\u0930\u092A\u094D\u0930\u093E\u0907\u091C\u093C',
    'upgrade.disclaimer': '*\u0909\u092A\u092F\u094B\u0917 \u0938\u0940\u092E\u093E\u090F\u0901 \u0932\u093E\u0917\u0942\u0964 \u0926\u093F\u0916\u093E\u0908 \u0917\u0908 \u0915\u0940\u092E\u0924\u094B\u0902 \u092E\u0947\u0902 \u0932\u093E\u0917\u0942 \u0915\u0930 \u0936\u093E\u092E\u093F\u0932 \u0928\u0939\u0940\u0902 \u0939\u0948\u0964',

    // Search
    'search.placeholder': '\u091A\u0948\u091F \u0914\u0930 \u092A\u094D\u0930\u094B\u091C\u0947\u0915\u094D\u091F \u0916\u094B\u091C\u0947\u0902',
    'search.loading': '\u0932\u094B\u0921 \u0939\u094B \u0930\u0939\u093E \u0939\u0948...',
    'search.noResults': '\u0915\u094B\u0908 \u092A\u0930\u093F\u0923\u093E\u092E \u0928\u0939\u0940\u0902 \u092E\u093F\u0932\u093E',
  },
};

export function createT(lang: Lang) {
  return (key: string, vars?: Record<string, string>): string => {
    let str = translations[lang]?.[key] ?? translations['en'][key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, v);
      });
    }
    return str;
  };
}
