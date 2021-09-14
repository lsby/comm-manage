import * as tools from '@lsby/js_tools'
import lib from '../dist/'

type 发送消息实体 = { msg: string }
type 返回消息实体 = { m: string }
var 通信管理者 = lib<发送消息实体, 返回消息实体>(async (data) => {}, '默认通道')

describe('基本测试', function () {
    it('测试1', async function () {
        var id = await 通信管理者.发送({ msg: '这是消息' })
        await 通信管理者.接收({ id: id, data: { m: '这是返回' }, err: null, 通道名称: '默认通道' })
        var x = await 通信管理者.消费(id)
        tools.断言相等('这是返回', x.m)
    })
    it('测试2', async function () {
        var id = await 通信管理者.发送({ msg: '这是消息' })
        setTimeout(() => {
            通信管理者.接收({ id: id, data: { m: '这是返回' }, err: null, 通道名称: '默认通道' })
        }, 1000)
        var x = await 通信管理者.消费(id)
        tools.断言相等('这是返回', x.m)
    })
})
