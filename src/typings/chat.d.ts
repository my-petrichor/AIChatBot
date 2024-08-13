declare namespace Chat {

	interface Chat {
		dateTime: string
		text: string
		inversion?: boolean
		error?: boolean
		loading?: boolean
		queryContent?: any
		conversationOptions?: ConversationRequest | null
		// requestOptions: { prompt: string; options?: ConversationRequest | null }
		type?:string
		selectedContent?:string
		sourceDocumentsTypeData?:any,
		generalQueryData?:any,
		abstractData?:any,
		shouldNotHaveRegenerateIcon?:boolean
		[string]:any
	}

	interface History {
		title: string
		isEdit: boolean
		uuid: number | string
	}

	interface ChatState {
		active: number | null | string
		usingContext: boolean;
		history: History[]
		chat: { uuid: number | string; data: Chat[] }[]
		chatMode:number
		typeInKbChat:number
		modelInKB:string,
		knowledgeRepo:any[],
		myFileList:any[],
		selectedModel:string,
		quote:string,
		selectedQuery:string,
		isChatLoading:boolean
	}

	interface IdState{
		knowledgeid: any[],
		knowledgeidInself: any[],
	}

	interface ConversationRequest {
		conversationId?: string
		parentMessageId?: string
	}

	interface ConversationResponse {
		conversationId: string
		detail: {
			choices: { finish_reason: string; index: number; logprobs: any; text: string }[]
			created: number
			id: string
			model: string
			object: string
			usage: { completion_tokens: number; prompt_tokens: number; total_tokens: number }
		}
		id: string
		parentMessageId: string
		role: string
		text: string
	}
}
