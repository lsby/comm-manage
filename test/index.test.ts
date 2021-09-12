import lib from '../dist/'
import * as tools from '@lsby/js_tools'

var 通信管理者 = lib(async (data: string) => {})

describe('基本测试', function () {
    it('测试1', async function () {
        var id = await 通信管理者.发送('这是消息')
        await 通信管理者.接收(JSON.stringify({ id, data: '这是返回内容' }))
        var x = await 通信管理者.消费(id)
        tools.断言相等('这是返回内容', x)
    })
    it('测试2', async function () {
        var id = await 通信管理者.发送('这是消息')
        setTimeout(() => {
            通信管理者.接收(JSON.stringify({ id, data: '这是返回内容' }))
        }, 1000)
        var x = await 通信管理者.消费(id)
        tools.断言相等('这是返回内容', x)
    })
})
