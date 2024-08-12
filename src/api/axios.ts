// /* eslint-disable prefer-promise-reject-errors */
// import type { AxiosResponse } from 'axios'
// import axios from 'axios'

// import { useMessage } from 'naive-ui'
// const instance = axios.create({
//   // process.env.NODE_ENV === 'development' 来判断是否开发环境
//   baseURL: window.baseApi ?? '/api',
//   headers: {
//     'Content-Type': 'application/json;charset=UTF-8',
//   },
//   // timeout: 5000,
// })
// const message = useMessage()
// // const userStore = useUserStore()

// // Function to get the value of a cookie by its name
// // function getCookieValue(name) {
// //   const value = `;${document.cookie}`;
// //   const parts = value.split(`; ${name}=`);
// //   if (parts.length === 2) return parts?.pop().split(';').shift();
// //   return parts[0]
// // }

// // Axios interceptor to add sessionid to the request headers
// // instance.interceptors.request.use((config) => {
// //   const sessionid = getCookieValue('sessionid');
// //   if (sessionid) {
// //     config.headers.Cookie = `sessionid=${sessionid}`;
// //   }
// //   return config;
// // });
// // const userStore = useUserStore()

// instance.interceptors.response.use(
//   (response: AxiosResponse) => {
//     if (response) {
//       switch (response.data.code) {
//         case 200:
//           // return Promise.reject(response.data.code);

//           break
//         case 401:
//           // 返回 401 清除token信息并跳转到登录页面
//           console.log('401')
//           // message.error('401')
//           // alert('401,请重新登录或刷新页面')
//           sessionStorage.removeItem('xtoken')
//           // window.location.href = '/'
//           return Promise.reject(response.data.code)
//           // alert('401,请重新登录或刷新页面')
//           break
//         case 403:
//           console.log('403')
//           break

//         case 404:
//           console.log('404')
//           break
//         case 500:
//           console.log('500')

//           // message.error('500')
//           break
//       }
//     }
//     return response
//   },
//   async (error) => {
//     if (error.response) {
//       switch (error.response.status) {
//         case 401:
//           // 返回 401 清除token信息并跳转到登录页面
//           // message.error('401')
//           // alert('401,请重新登录或刷新页面')
//           sessionStorage.removeItem('xtoken')
//           // window.location.href = '/'
//           break
//         case 403:
//           message.error('403')
//           break
//         case 404:
//           message.error('404')
//           break
//         case 500:
//           message.error('500')
//       }
//     }
//     return await Promise.reject()
//   },
// )

// export default instance

/* eslint-disable prefer-promise-reject-errors */
import type { AxiosResponse } from 'axios'
import axios from 'axios'

import { useMessage } from 'naive-ui'
const request = axios.create({
  // process.env.NODE_ENV === 'development' 来判断是否开发环境
  baseURL: window.baseApi ?? '/api',
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
  // timeout: 5000,
})
const request2 = axios.create({
	// process.env.NODE_ENV === 'development' 来判断是否开发环境
	baseURL: window.baseApi ?? '/api2',
	headers: {
		'Content-Type': 'application/json;charset=UTF-8',
	},
	// timeout: 5000,
})
const message = useMessage()
// const userStore = useUserStore()

// Function to get the value of a cookie by its name
// function getCookieValue(name) {
//   const value = `;${document.cookie}`;
//   const parts = value.split(`; ${name}=`);
//   if (parts.length === 2) return parts?.pop().split(';').shift();
//   return parts[0]
// }

// Axios interceptor to add sessionid to the request headers
// instance.interceptors.request.use((config) => {
//   const sessionid = getCookieValue('sessionid');
//   if (sessionid) {
//     config.headers.Cookie = `sessionid=${sessionid}`;
//   }
//   return config;
// });
// const userStore = useUserStore()

request.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response) {
      switch (response.data.code) {
        case 200:
          // return Promise.reject(response.data.code);

          break
        case 401:
          // 返回 401 清除token信息并跳转到登录页面
          console.log('401')
          // message.error('401')
          // alert('401,请重新登录或刷新页面')
          sessionStorage.removeItem('xtoken')
          // window.location.href = '/'
          return Promise.reject(response.data.code)
          // alert('401,请重新登录或刷新页面')
          break
        case 403:
          console.log('403')
          break

        case 404:
          console.log('404')
          break
        case 500:
          console.log('500')

          // message.error('500')
          break
      }
    }
    return response
  },
  async (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 返回 401 清除token信息并跳转到登录页面
          // message.error('401')
          // alert('401,请重新登录或刷新页面')
          sessionStorage.removeItem('xtoken')
          // window.location.href = '/'
          break
        case 403:
          message.error('403')
          break
        case 404:
          message.error('404')
          break
        case 500:
          message.error('500')
      }
    }
    return await Promise.reject()
  },
)

request2.interceptors.response.use(
	(response: AxiosResponse) => {
		if (response) {
			switch (response.data.code) {
				case 103:
					console.log('103')
					showCustomAlert("token过期，将跳转并重新登录")
					sessionStorage.removeItem('xtoken')
					window.location.href = '/'
					break
				case 200:
					// return Promise.reject(response.data.code);

					break
				case 401:
					// 返回 401 清除token信息并跳转到登录页面
					console.log('401')
					// message.error('401')
					// alert('401,请重新登录或刷新页面')
					sessionStorage.removeItem('xtoken')
					window.location.href = '/'
					break
				case 403:
					console.log('403')
					break

				case 404:
					console.log('404')
					break
				case 500:
					console.log('500')

					// message.error('500')
					break
			}
		}
		return response
	},
	async (error) => {
		if (error.response) {
			switch (error.response.status) {
				case 401:
					// 返回 401 清除token信息并跳转到登录页面
					// message.error('401')
					// alert('401,请重新登录或刷新页面')
					sessionStorage.removeItem('xtoken')
					// window.location.href = '/'
					break
				case 403:
					message.error('403')
					break
				case 404:
					message.error('404')
					break
				case 500:
					message.error('500')
			}
		}
		return await Promise.reject()
	},
)
export { request, request2 }

