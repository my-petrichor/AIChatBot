import { api, api2, fetchStream, fetchStream2 } from './api'

export const chat = (params: any) => {
  return api({
    url: '/chat',
    method: 'post',
    data: JSON.stringify(params),
  })
}

export const chatPublicRepo = (params: any) => {
  return api({
    url: '/local_doc_qa/local_doc_chat',
    method: 'post',
    data: JSON.stringify(params),
  })
}

export const chatMyKb = (params: any, auth: any) => {
  return api({
    url: '/my_kb/qa',
    method: 'post',
    data: JSON.stringify(params),
    headers: {
      auth, // Overriding the default Content-Type for this request
    },
  })
}

export const chatHistory = (params: any) => {
  return api({
    url: '/local_doc_qa/local_doc_chat',
    method: 'post',
    data: JSON.stringify(params),
  })
}

export const getfilelist = (knowledge_base_id: any) => {
  return api({
    url: '/local_doc_qa/list_files',
    method: 'get',
    params: { knowledge_base_id },
  })
}

export const getWritingStyleList = () => {
  return api2({
    url: '/api/v1/marketing/writing/list_styles',
    method: 'get',
  })
}

// api/v1/style_rewriting/list_styles

export const getWritingStyleList2 = () => {
  return api2({
    url: '/api/v1/style_rewriting/list_styles',
    method: 'get',
  })
}

// /api/v1/sale_promotion/list_brand_owners
export const getBrandOwnerList = () => {
  return api2({
    url: '/api/v1/sale_promotion/list_brand_owners',
    method: 'get',
  })
}

// /api/v1/marketing_writing/list_brand_owners
export const getMarketingWritingBrandOwnerList = () => {
  return api2({
    url: '/api/v1/marketing_writing/list_brand_owners',
    method: 'get',
  })
}

// /api/v1/marketing_writing/list_shop_types
export const getMarketingWritingListShopTypes = () => {
  return api2({
    url: '/api/v1/marketing_writing/list_shop_types',
    method: 'get',
  })
}

export const bing_search = (params: any) => {
  return api({
    url: '/local_doc_qa/bing_search_chat',
    method: 'post',
    data: JSON.stringify(params),

  })
}
export const deletefile = (params: any) => {
  return api({
    url: '/local_doc_qa/delete_file',
    method: 'post',
    data: JSON.stringify(params),
  })
}

export const deletefileInself = (params: any) => {
  return api({
    url: '/local_doc_qa/delete_file',
    method: 'post',
    data: JSON.stringify(params),
  })
}

export function PostLogin<T>(params: any) {
  return api({
    url: '/users/login',
    method: 'post',
    data: JSON.stringify(params),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded', // Overriding the default Content-Type for this request
    },
  })
}

export const getfilelistInSelf = (auth: any) => {
  return api({
    url: '/my_kb/list_kbs',
    method: 'get',
    headers: {
      auth, // Overriding the default Content-Type for this request
    },
  })
}

export const getUserProfile = (auth: any) => {
  return api({
    url: '/users/profile',
    method: 'get',
    headers: {
      auth, // Overriding the default Content-Type for this request
    },
  })
}

export const PostAddMyKb = (params: any, auth: string) => {
  return api({
    url: '/my_kb/add_kb',
    method: 'post',
    data: JSON.stringify(params),
    headers: {
      auth, // Overriding the default Content-Type for this request
    },
  })
}

export const PostGenerateAbstractInMyKb = (params: any, auth: string) => {
  return api({
    url: '/my_kb/generate_abstracts',
    method: 'post',
    data: JSON.stringify(params),
    headers: {
      auth, // Overriding the default Content-Type for this request
    },
  })
}
// //my_kb/preview_file
export const PostPreviewFileInMyKb = (params: any, auth: string) => {
  return api({
    url: '/my_kb/preview_file',
    method: 'post',
    data: JSON.stringify(params),
    headers: {
      auth, // Overriding the default Content-Type for this request
    },
  })
}

export const DeleteAddMyKb = (params: any, auth: string) => {
  return api({
    url: '/my_kb/delete_kb',
    method: 'delete',
    data: JSON.stringify(params),
    headers: {
      auth, // Overriding the default Content-Type for this request
    },
  })
}

export const PostUploadFileToMyKb = (params: any, auth: any, onUploadProgress: (progressEvent: any) => void) => {
  return api({
    url: '/my_kb/upload_file',
    method: 'post',
    data: params,
    headers: {
      'auth': auth, // Overriding the default Content-Type for this request
      'Content-Type': 'multipart/form-data;boundary=----WebKitFormBoundaryMhVIh6XPLDcPZhGO',
    },
    onUploadProgress, // Pass the progress callback to Axios
  })
}

export const DeleteDeleteFileToMyKb = (params: any, auth: any) => {
  return api({
    url: '/my_kb/delete_file',
    method: 'delete',
    data: params,
    headers: {
      auth, // Overriding the default Contendt-Type for this request
    },
  })
}

export const web_url = () => {
  return window.location.origin
}
export const setapi = () => {
  return window.baseApi
}

export const postNoteList = (auth: any) => {
  return api({
    url: '/note/list_note',
    method: 'post',
    headers: {
      auth, // Overriding the default Contendt-Type for this request
    },
  })
}

// /note/add_note
// {
//   "note_book_name": "test_note",
//   "content": "## 123"
// }
export const postAddNote = (params: any, auth: any) => {
  return api({
    url: '/note/add_note',
    method: 'post',
    data: JSON.stringify(params),
    headers: {
      auth, // Overriding the default Contendt-Type for this request
    },
  })
}

// post /note/edit_note
// {
//   "note_book_name": "string",
//   "content": "string"
// }

export const postEditNote = (params: any, auth: any) => {
  return api({
    url: '/note/edit_note',
    method: 'post',
    data: JSON.stringify(params),
    headers: {
      auth, // Overriding the default Contendt-Type for this request
    },
  })
}

// `post /note/delete_note`
// {
//   "note_book_name": ""test_note""
// }

export const postDeleteNote = (params: any, auth: any) => {
  return api({
    url: '/note/delete_note',
    method: 'post',
    data: JSON.stringify(params),
    headers: {
      auth, // Overriding the default Contendt-Type for this request
    },
  })
}

// my_kb/update_filename
// {
//   "kb_name":"test",
//   "old_filename":"old.pdf",
//   "new_filename":"new.pdf"
// }
export const postUpdateFileName = (params: any, auth: any) => {
  return api({
    url: '/my_kb/update_filename',
    method: 'post',
    data: JSON.stringify(params),
    headers: {
      auth, // Overriding the default Contendt-Type for this request
    },
  })
}

// post /note/edit_note
// {
//   "old_name": "string",
//   "new_name": "string"
// }

export const postUpdateNoteBookName = (params: any, auth: any) => {
  return api({
    url: '/note/update_name',
    method: 'post',
    data: JSON.stringify(params),
    headers: {
      auth, // Overriding the default Contendt-Type for this request
    },
  })
}

export const chatPublicRepoStream = (params: any, auth: any, onStart: () => any, onUpdate: (arg0: any) => any, onError: (arg0: any) => any, onClose: () => any) => {
  return fetchStream(
    'post',
    '/api/local_doc_qa/local_doc_chat_stream_test',
    auth,
    params,
    onStart,
    onUpdate,
    onError,
    onClose,
  )
}

export const styleConverstionStream = (params: any, auth: any, onStart: () => any, onUpdate: (arg0: any) => any, onError: (arg0: any) => any, onClose: () => any) => {
  return fetchStream2(
    'post',
    'api2/api/v1/style_rewriting/generate_query_stream',
    auth,
    params,
    onStart,
    onUpdate,
    onError,
    onClose,
  )
}

export const memberPromotionConverstionStream = (params: any, auth: any, onStart: () => any, onUpdate: (arg0: any) => any, onError: (arg0: any) => any, onClose: () => any) => {
  return fetchStream2(
    'post',
    'api2/api/v1/sale_promotion/generate_query_stream',
    auth,
    params,
    onStart,
    onUpdate,
    onError,
    onClose,
  )
}

export const marketingWritingConverstionStream = (params: any, auth: any, onStart: () => any, onUpdate: (arg0: any) => any, onError: (arg0: any) => any, onClose: () => any) => {
  console.log(params, "======params")
  return fetchStream2(
    'post',
    'api2/api/v1/marketing_writing/generate_query_stream',
    auth,
    params,
    onStart,
    onUpdate,
    onError,
    onClose,
  )
}

export const styleConverstionStreamWithHistory = (params: any, auth: any, onStart: () => any, onUpdate: (arg0: any) => any, onError: (arg0: any) => any, onClose: () => any) => {
  return fetchStream2(
    'post',
    'api2/api/v1/style_rewriting/qa_conversation_stream',
    auth,
    params,
    onStart,
    onUpdate,
    onError,
    onClose,
  )
}

export const memberPromotionConverstionStreamWithHistory = (params: any, auth: any, onStart: () => any, onUpdate: (arg0: any) => any, onError: (arg0: any) => any, onClose: () => any) => {
  return fetchStream2(
    'post',
    'api2/api/v1/sale_promotion/qa_conversation_stream',
    auth,
    params,
    onStart,
    onUpdate,
    onError,
    onClose,
  )
}

export const marketingWritingConverstionStreamWithHistory = (params: any, auth: any, onStart: () => any, onUpdate: (arg0: any) => any, onError: (arg0: any) => any, onClose: () => any) => {
  console.log("==marketingWritingConverstionStreamWithHistorymarketingWritingConverstionStreamWithHistorymarketingWritingConverstionStreamWithHistorymarketingWritingConverstionStreamWithHistory")
  return fetchStream2(
    'post',
    'api2/api/v1/marketing_writing/qa_conversation_stream',
    auth,
    params,
    onStart,
    onUpdate,
    onError,
    onClose,
  )
}

export const chatMyKbStream = (params: any, auth: any, onStart: () => any, onUpdate: (arg0: any) => any, onError: (arg0: any) => any, onClose: () => any) => {
  return fetchStream(
    'post',
    '/api/my_kb/qa_stream',
    auth,
    params,
    onStart,
    onUpdate,
    onError,
    onClose,
  )
}

// `post /generate/general_querys`
// {
//   "id":'ml',
//    "type" : 1
// }

export const postGenerateGeneralQuery = (params: any, auth: any) => {
  return api({
    url: '/generate/general_querys',
    method: 'post',
    data: JSON.stringify(params),
    headers: {
      auth, // Overriding the default Contendt-Type for this request
    },
  })
}

// ### Example request

// > 请求体参数

// ```json
// {
//   "kb_name": "test"
// }
// ```
export const postConversationRecord = (params: any, auth: any) => {
  return api({
    url: '/my_kb/conversation_record',
    method: 'post',
    data: JSON.stringify(params),
    headers: {
      auth, // Overriding the default Contendt-Type for this request
    },
  })
}
export const getSms = (phone: any, usage: any) => {
  return api({
    url: '/getSms',
    method: 'get',
    params: { phone, usage },
  })
}

// approveRegistration
export const approveRegistration = (token: any) => {
  return api({
    url: '/users/approve_registration',
    method: 'get',
    params: { token },
  })
}

// rejectRegistration
export const rejectRegistration = (token: any) => {
  return api({
    url: '/users/reject_registration',
    method: 'get',
    params: { token },
  })
}

export function PostLoginToChat<T>(params: any) {
  return api({
    url: '/users/loginToChat',
    method: 'post',
    data: JSON.stringify(params),
    headers: {
      'Content-Type': ' application/json', // Overriding the default Content-Type for this request
    },
  })
}

export function PostSignupToChat<T>(params: any) {
  return api({
    url: '/users/signupToChat',
    method: 'post',
    data: JSON.stringify(params),
    headers: {
      'Content-Type': ' application/json', // Overriding the default Content-Type for this request
    },
  })
}

export function PostQueryMerge<T>(params: any, auth: string) {
  return api({
    url: '/query/merge',
    method: 'post',
    data: JSON.stringify(params),
    headers: {
      auth, // Overriding the default Contendt-Type for this request
    },
  })
}
