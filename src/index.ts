// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register({ strapi }) {
    strapi
      .plugin('users-permissions')
      .service('providers-registry')
      .add('kakao', {
        icon: 'https://developers.kakao.com/assets/img/favicon.ico', // Kakao 아이콘 (선택 사항)
        enabled: true,
        grantConfig: {
          key: process.env.KAKAO_CLIENT_ID || 'your-kakao-client-id', // Kakao REST API 키
          secret: process.env.KAKAO_CLIENT_SECRET || 'your-kakao-client-secret', // Kakao Client Secret (선택 사항, Kakao는 필수 아님)
          callback: `${strapi.config.server.url}/auth/kakao/callback`, // 콜백 URL
          scope: ['profile_nickname', 'profile_image', 'account_email'], // Kakao에서 제공하는 스코프
          authorize_url: 'https://kauth.kakao.com/oauth/authorize', // Kakao 인증 URL
          access_url: 'https://kauth.kakao.com/oauth/token', // Kakao 토큰 요청 URL
          oauth: 2,
        },
        async authCallback({ accessToken, providers, purest }) {
          console.log('Received Access Token:', accessToken) // 디버깅 로그
          const kakao = purest({ provider: 'kakao' })
          try {
            const userResponse = await kakao
              .get('https://kapi.kakao.com/v2/user/me')
              .auth(accessToken)
              .request()
            console.log('Kakao User Response:', userResponse.body) // 디버깅 로그
            const { kakao_account } = userResponse.body
            console.log('Returning User Data:', {
              username: kakao_account.profile.nickname || 'kakao_user',
              email: kakao_account.email || `kakao_${kakao_account.id}@example.com`,
              provider: 'kakao',
              providerId: kakao_account.id,
            })
            return {
              username: kakao_account.profile.nickname || 'kakao_user',
              email: kakao_account.email || `kakao_${kakao_account.id}@example.com`,
              provider: 'kakao',
              providerId: kakao_account.id,
            }
          } catch (error) {
            console.error('Error in authCallback:', error) // 에러 로그
            throw new Error('Failed to fetch Kakao user info')
          }
        },
      })
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {},
}
