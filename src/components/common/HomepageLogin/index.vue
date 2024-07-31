<script setup lang="ts">
import { computed, defineEmits, defineProps, ref } from 'vue'
import type { FormInst, FormItemRule, FormValidationError } from 'naive-ui'
import { NButton, NForm, NFormItem, NInput, NModal, NTabPane, NTabs, useMessage } from 'naive-ui'
import { useRouter } from 'vue-router'
import { debounce } from 'lodash'
import { PostLoginToChat, PostSignupToChat, getSms } from '@/api/chat'
import { useUserStore } from '@/store'

interface Props {
  visible: boolean
}

interface Emit {
  (e: 'update:visible', visible: boolean): void
}
const props = defineProps<Props>()
const emit = defineEmits<Emit>()
const router = useRouter()
const userStore = useUserStore()

const loginForm = ref({
  username: '',
  password: '',
})
const smsForm = ref({
  phone: '',
  sms: '',
})
const companyForm = ref({
  company: '',
  name: '',
  phone: '',
  smsCode: '',
  reason: '',
})
const individualForm = ref({
  name: '',
  phone: '',
  smsCode: '',
  job: '',
  reason: '',
})
const message = useMessage()
const mode = ref('login')
const tab = ref('passwordLogin')
const sms_code = ref('')
const get_sms_counter = ref(0)
const loginRules = ref({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
})
const phonePattern = /^\d{11}$/ // Matches exactly 11 digits

const smsRules = ref({
  phone: [{
    required: true,
    message: '请输入正确的手机号码',
    trigger: 'blur',
    validator: (rule: FormItemRule, value: string) => {
      return phonePattern.test(value)
    },
  }],
  sms: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
})

const companyRules = ref({
  company: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
  name: [{ required: true, message: '请输入个人名称', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  smsCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入原因', trigger: 'blur' }],
})

const individualRules = ref({
  name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  smsCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
  job: [{ required: true, message: '请输入工作', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入申请原因', trigger: 'blur' }],
})

const loginFormRef = ref<FormInst | null>(null)
const smsFormRef = ref<FormInst | null>(null)
const companyFormRef = ref<FormInst | null>(null)
const individualFormRef = ref<FormInst | null>(null)
const count_down = () => {
  const timer = setInterval(() => {
    if (get_sms_counter.value > 0)
      get_sms_counter.value -= 1
    else
      clearInterval(timer)
  }, 1000)
}

const login = (e: { preventDefault: () => void }) => {
  e.preventDefault()
  switch (tab.value) {
    case 'passwordLogin':
      // console.log('passwordLogin', loginForm.value, loginFormRef, loginFormRef.value)
      loginFormRef.value?.validate(async (errors: Array<FormValidationError> | undefined) => {
        if (!errors) {
          // perform the login logic api request
          await PostLoginToChat({
            username: loginForm.value.username,
            password: loginForm.value.password,
          }).then((res) => {
            if (res.data.code === 200) {
              console.log('PostLoginToChat', res)
              const access_token = res.data.data.access_token
              const name = res.data.data.username
              userStore.setLoginState(true)
              userStore.updateUserInfo({
                name,
              })
              userStore.setAccessToken(access_token)
              message.success('登录成功')
              router.replace('/chat')
            }
            else {
              message.error('Login Failed,', res.data.msg)
            }
          }).catch((err) => {
            console.log('PostLoginToChat', err)
            message.error('Login Failed')
          }).finally(() => {
            console.log('PostLoginToChat', 'finally')
          })
        }
        else {
          console.log(errors)
          message.error('Invalid')
        }
      },
      )
      break
    case 'smsLogin':
      console.log('smsLogin', smsForm.value)
      if (smsForm.value.sms !== sms_code.value)
        message.error('Invalid SMS code')
      smsFormRef.value?.validate(async (errors: Array<FormValidationError> | undefined) => {
        if (!errors) {
          await PostLoginToChat({
            phone: smsForm.value.phone,
            sms_code: smsForm.value.sms,
          }).then((res) => {
            if (res.data.code === 200) {
              console.log('PostLoginToChat in res', res)
              const access_token = res.data.data.access_token
              const name = res.data.data.username
              userStore.setLoginState(true)
              userStore.updateUserInfo({
                name,
              })
              userStore.setAccessToken(access_token)
              message.success('登录成功')
              router.replace('/chat')
            }
            else {
              message.error('Login Failed,', res.data.msg)
            }
          },
          ).catch((err) => {
            console.log('PostLoginToChat in err', err)
            message.error('Login Failed')
          }).finally(() => {
            console.log('PostLoginToChat', 'finally')
          })
        }
        else {
          console.log(errors)
          message.error('Invalid')
        }
      },
      )
      break
    default:
      break
  }
}

const signup = (e: { preventDefault: () => void }) => {
  e.preventDefault()
  console.log('signup', mode.value)
  switch (tab.value) {
    case 'company':
      console.log('company,companyForm.value.smsCode,sms_code.value', companyForm.value, companyForm.value.smsCode, sms_code.value)
      if (companyForm.value.smsCode !== sms_code.value) {
        message.error('Invalid SMS code')
        break
      }
      companyFormRef.value?.validate(async (errors: Array<FormValidationError> | undefined) => {
        if (!errors) {
          await PostSignupToChat({
            company: companyForm.value.company,
            username: companyForm.value.name,
            phone: companyForm.value.phone,
            reason: companyForm.value.reason,
            user_type: 'company',
          }).then((res) => {
            console.log('PostSignupToChat', res)
            if (res.data.code === 200)
              message.success(res.data.msg)
          }).catch((err) => {
            console.log('PostSignupToChat', err)
          }).finally(() => {
            console.log('PostSignupToChat', 'finally')
          })
        }
        else {
          console.log(errors)
          message.error('Invalid')
        }
      })

      break
    case 'individual':
      console.log('individual', individualForm.value)
      if (individualForm.value.smsCode !== sms_code.value) {
        message.error('Invalid SMS code')
        break
      }
      individualFormRef.value?.validate(async (errors: Array<FormValidationError> | undefined) => {
        if (!errors) {
          await PostSignupToChat({
            username: individualForm.value.name,
            phone: individualForm.value.phone,
            job: individualForm.value.job,
            reason: individualForm.value.reason,
            user_type: 'individual',
          }).then((res) => {
            console.log('PostSignupToChat', res)
            if (res.data.code === 200)
              message.success(res.data.msg)
          }).catch((err) => {
            console.log('PostSignupToChat', err)
          }).finally(() => {
            console.log('PostSignupToChat', 'finally')
          })
        }
        else {
          console.log(errors)
          message.error('Invalid')
        }
      })
      break
    default:
      break
  }
}
const debounceSignup = debounce(signup, 1000)
const show = computed({
  get() {
    return props.visible
  },
  set(visible: boolean) {
    emit('update:visible', visible)
  },
})

const resetDefault = () => {
  // Reset the login form when the modal is closed
  loginForm.value = {
    username: '',
    password: '',
  }
  smsForm.value = {
    phone: '',
    sms: '',
  }
  companyForm.value = {
    company: '',
    name: '',
    phone: '',
    smsCode: '',
    reason: '',
  }
  individualForm.value = {
    name: '',
    phone: '',
    smsCode: '',
    job: '',
    reason: '',
  }
}
const changeTabInLogin = (value: string) => {
  console.log('changeTabInLogin', value)
  tab.value = value
  resetDefault()
}

const changeTabInSignup = (value: string) => {
  console.log('changeTabInSignup', value)
  tab.value = value
  resetDefault()
}

const applyForInternalTest = () => {
  mode.value = 'signup'
  tab.value = 'company'
  resetDefault()
}
const loginNow = () => {
  mode.value = 'login'
  tab.value = 'passwordLogin'
  resetDefault()
}

const getSmsCode = () => {
  console.log('getSmsCode tab.value', tab.value)
  console.log('mode.value', mode.value)
  let phone = ''
  sms_code.value = ''
  switch (tab.value) {
    case 'smsLogin':
      phone = smsForm.value.phone
      break
    case 'company':
      phone = companyForm.value.phone
      break
    case 'individual':
      phone = individualForm.value.phone
      break
    default:
      break
  }
  if (phone === '') {
    message.error('请输入手机号')
    return
  }
  getSms(phone, mode.value).then((res) => {
    console.log('getSms', res)
    sms_code.value = res.data.msg
    get_sms_counter.value = 60
    count_down()
    message.success('验证码已发送')
  }).catch((err) => {
    console.log('getSms', err)
    message.error('验证码发送失败')
  }).finally(() => {
    console.log('getSms', 'finally')
  })
}
</script>

<template>
  <NModal
    v-model:show="show" :title="mode === 'login' ? '登录' : '内测申请'" :auto-focus="false" preset="card"
    style="width: 95%; max-width: 640px"
  >
    <NTabs v-if="mode === 'login'" type="segment" animated :on-update:value="changeTabInLogin">
      <NTabPane name="passwordLogin" tab="密码登录">
        <NForm ref="loginFormRef" :model="loginForm" :rules="loginRules">
          <NFormItem :show-label="false" label-style="" label="" prop="username" path="username">
            <NInput v-model:value="loginForm.username" placeholder="账号" />
          </NFormItem>
          <NFormItem :show-label="false" label="" path="password" prop="password">
            <NInput v-model:value="loginForm.password" type="password" placeholder="密码" />
          </NFormItem>
        </NForm>
      </NTabPane>
      <NTabPane name="smsLogin" tab="验证码登录">
        <NForm ref="smsFormRef" :model="smsForm" :rules="smsRules">
          <NFormItem label="" :show-label="false" path="phone" prop="phone">
            <NInput v-model:value="smsForm.phone" placeholder="手机号" />
          </NFormItem>
          <NFormItem :show-label="false" label="" path="sms" prop="sms">
            <NInput v-model:value="smsForm.sms" placeholder="验证码">
              <template #suffix>
                <span
                  v-if="get_sms_counter <= 0" style="border-left: 1px rgba(66, 70, 87, 1) solid;
                  padding-left: 10px;
                  " @click="getSmsCode"
                >获取验证码</span>
                <span
                  v-else style="border-left: 1px rgba(66, 70, 87, 1) solid;
                  padding-left: 10px;
                  "
                >{{ get_sms_counter }}</span>
              </template>
            </NInput>
          </NFormItem>
        </NForm>
      </NTabPane>
    </NTabs>

    <template v-if="mode === 'login'">
      <div class="flex flex-col">
        <NButton
          style="
        width: 100%;
        " color="rgba(77, 70, 253, 1)" size="large" text-color="white" @click="login"
        >
          登录
        </NButton>
        <div class="w-full flex justify-center mt-7">
          <div>
            没有账号？<a style="color: rgba(96, 127, 255, 1);" @click="applyForInternalTest">
              内测申请
            </a>
          </div>
        </div>
      </div>
    </template>

    <NTabs v-if="mode === 'signup'" type="segment" animated :on-update:value="changeTabInSignup">
      <NTabPane name="company" tab="企业">
        <NForm ref="companyFormRef" :model="companyForm" :rules="companyRules">
          <NFormItem label="" :show-label="false" prop="company" path="company">
            <NInput v-model:value="companyForm.company" placeholder="公司名称" />
          </NFormItem>
          <NFormItem label="" prop="name" path="name" :show-label="false">
            <NInput v-model:value="companyForm.name" placeholder="姓名" />
          </NFormItem>
          <NFormItem :show-label="false" label="" prop="phone" path="phone">
            <NInput v-model:value="companyForm.phone" placeholder="手机号" />
          </NFormItem>
          <NFormItem :show-label="false" label="" prop="smsCode" path="smsCode">
            <NInput v-model:value="companyForm.smsCode" placeholder="验证码">
              <template #suffix>
                <span
                  v-if="get_sms_counter <= 0" style="border-left: 1px rgba(66, 70, 87, 1) solid;
                  padding-left: 10px;
                  " @click="getSmsCode"
                >获取验证码</span>
                <span
                  v-else style="border-left: 1px rgba(66, 70, 87, 1) solid;
                  padding-left: 10px;
                  "
                >{{ get_sms_counter }}</span>
              </template>
            </NInput>
          </NFormItem>
          <NFormItem :show-label="false" label="" prop="reason" path="reason">
            <NInput v-model:value="companyForm.reason" placeholder="申请理由" />
          </NFormItem>
        </NForm>
      </NTabPane>
      <NTabPane name="individual" tab="个人">
        <NForm ref="individualFormRef" :model="individualForm" :rules="individualRules">
          <NFormItem :show-label="false" label="" prop="name" path="name">
            <NInput v-model:value="individualForm.name" placeholder="姓名" />
          </NFormItem>
          <NFormItem :show-label="false" label="" prop="phone" path="phone">
            <NInput v-model:value="individualForm.phone" placeholder="手机号" />
          </NFormItem>
          <NFormItem :show-label="false" label="" prop="smsCode" path="smsCode">
            <NInput v-model:value="individualForm.smsCode" placeholder="验证码">
              <template #suffix>
                <span
                  v-if="get_sms_counter <= 0" style="border-left: 1px rgba(66, 70, 87, 1) solid;
                  padding-left: 10px;
                  " @click="getSmsCode"
                >获取验证码</span>
                <span
                  v-else style="border-left: 1px rgba(66, 70, 87, 1) solid;
                  padding-left: 10px;
                  "
                >{{ get_sms_counter }}</span>
              </template>
            </NInput>
          </NFormItem>
          <NFormItem :show-label="false" label="" prop="job" path="job">
            <NInput v-model:value="individualForm.job" placeholder="职位" />
          </NFormItem>
          <NFormItem :show-label="false" label="" prop="reason" path="reason">
            <NInput v-model:value="individualForm.reason" placeholder="申请理由" />
          </NFormItem>
        </NForm>
      </NTabPane>
    </NTabs>

    <template v-if="mode === 'signup'">
      <div class="flex flex-col">
        <NButton
          style="
        width: 100%;
        " color="rgba(77, 70, 253, 1)" size="large" text-color="white" @click="debounceSignup"
        >
          提交
        </NButton>
        <div class="w-full flex justify-center mt-7">
          <div>
            已有账号？<a style="color: rgba(96, 127, 255, 1);" @click="loginNow">
              立即登录
            </a>
          </div>
        </div>
      </div>
    </template>
  </NModal>
</template>

<style scoped lang="less">
.n-form {
  padding-left: 1px;
  padding-right: 1px
}
</style>
