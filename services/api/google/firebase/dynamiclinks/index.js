const { oauth2Client } = require('../../index');
function createDynamicProfileLink(user) {
  return new Promise(async (resolve, reject) => {
    const username = user?.username;
    const displayName = user?.display_name;
    const avatarUrl = user?.avatar_url;
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
          socialDescription: `
          1. Send songs with messages directly to your friends’ home screens to see what they really think about you and your music taste.\n
          2. Let your friends know what you think about the music they share and see how your friends rate your songs on your profile's daily music rating.\n
          3. All of the songs your friends send show up on your iPhone home screen widget.\n
          Questions, comments, concerns? DM us at @kiwiwidget :)\n`,
          socialImageLink:
            'https://is3-ssl.mzstatic.com/image/thumb/PurpleSource122/v4/6b/fe/64/6bfe64b5-ac4c-3882-75bb-459b40eb575d/0b5fdabf-7a0d-4251-affc-a3052e22a5a5_TallTwoCopyRight.png/230x0w.webp',
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
      console.log('This is the result status!\n', result.status);
      if (result.status === 200) {
        const link = result.data.managedShortLink.link;
        resolve(link);
      } else {
        reject(new Error(result.statusText));
      }
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { createDynamicProfileLink };
