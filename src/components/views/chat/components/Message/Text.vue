<script lang="ts" setup>
import { computed, onMounted, onUnmounted, onUpdated, ref } from 'vue'
import MarkdownIt from 'markdown-it'
import mdKatex from '@traptitech/markdown-it-katex'
import mila from 'markdown-it-link-attributes'
import hljs from 'highlight.js'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { t } from '@/locales'
import { copyToClip } from '@/utils/copy'
import { useChatStore } from '@/store'

interface Props {
  inversion?: boolean
  error?: boolean
  text?: string
  loading?: boolean
  queryContent?: any
  asRawText?: boolean
  type?: string
  selectedContent?: string
  sourceDocumentsTypeData?: any
  generalQueryData?: any
  abstractData?: any
}

const props = defineProps<Props>()
const chatStore = useChatStore()

const { isMobile } = useBasicLayout()

const textRef = ref<HTMLElement>()
const mdi = new MarkdownIt({
  html: false,
  linkify: true,
  highlight(code, language) {
    const validLang = !!(language && hljs.getLanguage(language))
    if (validLang) {
      const lang = language ?? ''
      return highlightBlock(hljs.highlight(code, { language: lang }).value, lang)
    }
    return highlightBlock(hljs.highlightAuto(code).value, '')
  },
})

mdi.use(mila, { attrs: { target: '_blank', rel: 'noopener' } })
mdi.use(mdKatex, { blockClass: 'katexmath-block rounded-md p-[10px]', errorColor: ' #cc0000' })

const wrapClass = computed(() => {
  return [
    'text-wrap',
    'min-w-[20px]',
    'rounded-md',
    isMobile.value ? 'p-2' : 'px-3 py-2',
    props.inversion ? 'bg-[#d2f9d1]' : 'bg-[#f4f6f8]',
    props.inversion ? 'dark:bg-[#5852D6]' : 'dark:bg-[#101114]',
    props.inversion ? 'message-request' : 'message-reply',
    { 'text-red-500': props.error },
  ]
})

const text = computed(() => {
  let value = props.text ?? ''
  if (props.selectedContent && props.selectedContent !== '')
    value = `${props.selectedContent}\n-------------------\n${value}`
  if (!props.asRawText && !props.inversion)
    return mdi.render(value)
  return value
})
function highlightBlock(str: string, lang?: string) {
  return `<pre class="code-block-wrapper"><div class="code-block-header"><span class="code-block-header__lang">${lang}</span><span class="code-block-header__copy">${t('chat.copyCode')}</span></div><code class="hljs code-block-body ${lang}">${str}</code></pre>`
}

function addCopyEvents() {
  if (textRef.value) {
    const copyBtn = textRef.value.querySelectorAll('.code-block-header__copy')
    copyBtn.forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn.parentElement?.nextElementSibling?.textContent
        if (code) {
          copyToClip(code).then(() => {
            btn.textContent = '复制成功'
            setTimeout(() => {
              btn.textContent = '复制代码'
            }, 1000)
          })
        }
      })
    })
  }
}

function removeCopyEvents() {
  if (textRef.value) {
    const copyBtn = textRef.value.querySelectorAll('.code-block-header__copy')
    copyBtn.forEach((btn) => {
      btn.removeEventListener('click', () => {})
    })
  }
}

const clickQuery = async (query: any) => {
  chatStore.setSelectedQuery(query)
}

onMounted(() => {
  addCopyEvents()
})

onUpdated(() => {
  addCopyEvents()
})

onUnmounted(() => {
  removeCopyEvents()
})
</script>

<template>
  <div
    class="text-white bg-[#101114]"
    :class="wrapClass"
  >
    <div ref="textRef" class="leading-relaxed break-words">
      <div v-if="!inversion">
        <template v-if="loading">
          <!-- <div v-if="queryContent" class="dark:text-white fadeIn " style="font-weight: bold; font-size: large !important;">
            <div>
              正在搜索：
              <span style="font-weight: 1000; font-size: larger !important">{{ queryContent }}</span>
            </div>
            <div>正在为你生成答案。。。<span class="dark:text-white w-[4px] h-[20px] inline-block animate-blink" /></div>
          </div> -->
          <div>
						<div v-if="!text">
            回答输入中...<span class="dark:text-white w-[4px] h-[20px] inline-block animate-blink" /></div>
          </div>
        </template>
        <div
          v-if="!asRawText"
        >
          <div v-if="type === 'source_documents'">
            <div
              class="markdown-body"
              style="background-color: #101114;"
              v-html="text"
            />
            <div v-if="sourceDocumentsTypeData?.source_documents?.length">
              数据来源：
            </div>
            <div class="mt-2">
              <div class="text-sm text-gray-400">
                <div v-for="(item, index) in sourceDocumentsTypeData?.source_documents" :key="item.file_name">
                  <div>
                    出处{{ index + 1 }}：<a
                      :href="`${'/static1/'}${item.file_url}`"
                      target="_blank"
                      class="text-blue-500"
                    >{{ item.file_name }}</a>
                  </div>
                  <div>
                    {{ item.content }}
                  </div>
                  <div>
                    {{ item.relation }}
                  </div>
                  <br>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="type === 'general_query'">
            <div
              style="font-weight: bold;"
            >
              知识库总结：
            </div>
            <div
              class="markdown-body"
              style="background-color: #101114;"
              v-html="generalQueryData?.abstract"
            />
            <div v-if="generalQueryData?.querys?.length">
              您可以点击提问以下问题：
            </div>
            <div class="mt-2">
              <div class="text-sm text-gray-400">
                <div
                  v-for="(item) in generalQueryData?.querys" :key="item"
                >
                  <div @click="clickQuery(item)">
                    <a
                      class="text-blue-500"
                      style="cursor: pointer;"
                    >{{ item }}</a>
                  </div>
                  <br>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="type === 'abstract'">
            <div v-if="abstractData?.file_abstract?.length > 1">
              <div
                style="font-weight: bold;"
              >
                知识库总结：
              </div>
              <div>
                <div
                  class="markdown-body"
                  v-html="mdi.render(abstractData?.kb_abstract)"
                />
              </div>
            </div>
            <div class="mt-2">
              <div class="text-sm">
                <div
                  v-for="(item) in abstractData?.file_abstract" :key="item"
                >
                  <div
                    style="font-weight: bold;"
                  >
                    {{ item.name }} 总结：
                  </div>
                  <div
                    class="markdown-body"
                    v-html="mdi.render(item.abstract)"
                  />
                  <br>
                </div>
              </div>
            </div>
          </div>
          <div
            v-else
            class="markdown-body"
            style="background-color: #101114;"
            v-html="text"
          />
        </div>
        <div v-else class="whitespace-pre-wrap" v-html="text" />
      </div>
      <div
        v-else class="whitespace-pre-wrap"
        v-html="text"
      />
    </div>
  </div>
</template>

<style lang="less" scoped>
@import url(./style.less);
.fadeIn {
  opacity: 1;
  cursor: pointer;
  transition: 0.25s all ease-in-out;
}

.fadeIn:hover {
  opacity: 1;
}
</style>
