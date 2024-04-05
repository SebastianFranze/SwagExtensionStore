import template from './sw-dashboard-statistics-promotion-card.html.twig';
import './sw-dashboard-statistics-promotion-card.scss';

const STATISTICS_APP_NAME = 'SwagBraintreeApp'; // TODO: change to statistics app name

export default Shopware.Component.wrapComponentConfig({
    template,

    inject: ['shopwareExtensionService', 'extensionStoreDataService'],

    i18n: {
        messages: {
            'en-GB': {
                title: 'Begin your journey to data driven success',
                'promotion-text': 'Ready, set, analyze! Get access to powerful tools to understand customer behavior and enhance your shop\'s performance. Don\'t wait — start collecting essential data now to be ahead of the game.',
                cta: 'Get started with analytics'
            }
        }
    },

    data() {
        return {
            extension: null,
            isAppInstalled: null,
        };
    },

    computed: {
        showBanner() {
            return !this.isAppInstalled && this.linkToStatisticsAppExists;
        },

        linkToStatisticsAppExists() {
            return !!this.extension;
        },

        languageId() {
            return Shopware.State.get('session').languageId;
        },
    },

    created() {
        void this.createdComponent();
    },

    methods: {
        async createdComponent() {
            this.isAppInstalled = Shopware.State.get('shopwareExtensions').myExtensions.data.some(
                // We don't care of it is active or not. We will show it as long as it is installed.
                (extension) => (extension.name === STATISTICS_APP_NAME) && extension.installedAt
            );

            console.log(["cychop app installed", this.isAppInstalled]);

            this.extension = await this.fetchExtension();
        },

        async fetchExtension() {
            if (this.languageId === '') {
                return null;
            }

            try {
                return this.extensionStoreDataService.getExtensionList(
                    { limit: 1, term: STATISTICS_APP_NAME },
                    { ...Shopware.Context.api, languageId: this.languageId },
                ).then(function(extensions) {
                    if (extensions.length === 0) {
                        return null;
                    }

                    const extension = extensions[0];

                    return extension.name === STATISTICS_APP_NAME ? extension : null;
                });
            } catch (error) {
                return null;
            }
        },

        goToStatisticsAppDetailPage() {
            if (!this.linkToStatisticsAppExists) {
                return;
            }

            this.$router.push({ name: 'sw.extension.store.detail', params: { id: this.extension.id } });
        },
    },
});
