import { User } from '../../../../../models/users';
import { default as logger } from '../../../../../logger';
import { oauth2Client } from '../../index';

export const createDynamicProfileLink = (user: User) => {
  return new Promise(async (resolve, reject) => {
    const username = user?.username;
    const displayName = user?.display_name;
    const userId = user?.id;
    const data = {
      dynamicLinkInfo: {
        domainUriPrefix: 'https://kiwi-app.me',
        link: `https://api.kiwi.wishroll.co/v1/users/${userId}`,
        androidInfo: {
          androidPackageName: 'com.mutualsapp', // android package name, fe my.app.io
        },
        iosInfo: {
          iosAppStoreId: '1614352817', // app store app id
          iosBundleId: 'org.reactjs.native.example.mutualsapp', // ios app bundle id, fe my.app.io
        },
        navigationInfo: {
          enableForcedRedirect: true,
        },
        analyticsInfo: {
          googlePlayAnalytics: {
            utmCampaign: '',
            utmMedium: '',
            utmSource: '',
          },
          itunesConnectAnalytics: {
            at: '',
            ct: '',
            mt: '',
            pt: '',
          },
        },

        socialMetaTagInfo: {
          socialDescription:
            "Kiwi is where you send songs and secret notes throughout the day to the person that's been on your mind - right on their home screen. Rate your crush's music taste and share how you really feel. Check out your potential crush's profile to see if your music taste is compatible. Let the people you like know that you're thinking about them with music. Questions, comments, concerns? DM us at @kiwiwidget",
          socialImageLink:
            'https://is5-ssl.mzstatic.com/image/thumb/PurpleSource112/v4/31/85/79/318579d1-8ab0-441d-196b-ac4f33b83ae5/26cdaf80-0c6d-438f-83b8-4c6da9489e82_TallLoveOne.jpg/460x0w.webp',
          socialTitle: `Add ${displayName || username} on Kiwi 🥝`,
        },
      },
      name: `Add ${displayName || username} on Kiwi 🥝`,
      suffix: {
        customSuffix: `${username}`,
        option: 'CUSTOM',
      },
    };
    try {
      const result = await oauth2Client.request({
        method: 'POST',
        url: 'https://firebasedynamiclinks.googleapis.com/v1/managedShortLinks:create',
        data,
      });
      logger(null).debug(
        { status: result.status },
        'This is the result status of creating dynamic profile link',
      );
      if (result.status === 200) {
        const link = result.data.managedShortLink.link;
        resolve(link);
      } else {
        reject(new Error(result.statusText));
      }
    } catch (error) {
      logger(null).error(new Error(''), 'Error when creating dynamic profile link');
      reject(error);
    }
  });
};
