import { SSE } from 'sse.js'
import {request,request2} from './axios'

export const api = async (data: object): Promise<any> => {
  return await request({
    ...data,
  })
}

export const api2 = async (data: object): Promise<any> => {
	return await request2({
		...data,
	})
}

export const fetchStream = (method: string, url: string, auth: string, data: object, onStart: () => any, onUpdate: (arg0: any) => any, onError: (arg0: any) => any, onClose: () => any) => {
  const params = JSON.stringify(data)
  const source = new SSE(url, {
    withCredentials: true,
    headers: {
      'Auth': `${auth}`,
      'Content-Type': 'application/json',
    },
    payload: params,
    method,
  })

  source.addEventListener('open', () => {
    onStart()
  })

  source.addEventListener('message', (e: { data: string }) => {
    const data = e.data ? JSON.parse(e.data) : {}
    onUpdate(data)
  })

  source.addEventListener('error', (e: { data: string }) => {
    onError(e.data)
  })

  source.addEventListener('close', () => {
    onClose()
  })

  source.stream()
}


export const fetchStream2 = (method: string, url: string, auth: string, data: object, onStart: () => any, onUpdate: (arg0: any) => any, onError: (arg0: any) => any, onClose: () => any) => {
  const params = JSON.stringify(data)
	console.log('fetchStream2',url,url.replace(/^\/api2/, ''),url.replace(/^\/api2/, ''))
  const source = new SSE(url, {
    withCredentials: true,
    headers: {
      'Auth': `${auth}`,
      'Content-Type': 'application/json',
    },
    payload: params,
    method,
  })
	console.log('fetchStream2', source)
  source.addEventListener('open', () => {
    onStart()
  })

  source.addEventListener('message', (e: { data: string }) => {
    const data = e.data ? JSON.parse(e.data) : {}
    onUpdate(data)
  })

  source.addEventListener('error', (e: { data: string }) => {
    onError(e.data)
  })

  source.addEventListener('close', () => {
    onClose()
  })

  source.stream()
}