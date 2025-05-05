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
          // Kakao 사용자 정보 가져오기
          const kakao = purest({ provider: 'kakao' })
          const userResponse = await kakao
            .get('https://kapi.kakao.com/v2/user/me')
            .auth(accessToken)
            .request()

          const { kakao_account } = userResponse.body

          return {
            username: kakao_account.profile.nickname || 'kakao_user', // 사용자 닉네임
            email:
              kakao_account.email || `kakao_${kakao_account.id}@example.com`, // 이메일 (없을 경우 대체)
            provider: 'kakao',
            providerId: kakao_account.id, // Kakao 사용자 ID
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
