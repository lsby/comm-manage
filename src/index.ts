import * as uuid from 'uuid'

export interface 管理者 {
    发送: (data: string) => Promise<string>
    接收: (data: string) => Promise<void>
    消费: (消息id: string, 超时时间?: number) => Promise<string | null>
}
export interface 发送消息 {
    id: string
    data: string
}
export interface 返回消息 {
    id: string
    err: string | null
    data: string | null
}
export interface 消息管理项 {
    id: string
    发送内容: string
    返回内容: string | null
    状态: '未回复' | '已回复'
}

var 消息转字符串 = JSON.stringify
var 字符串转消息 = JSON.parse

export default function 通信管理者(发送函数: (data: string) => Promise<void>) {
    var 映射表: { [消息id: string]: 消息管理项 } = {}
    var r: 管理者 = {
        async 发送(data) {
            var id = uuid.v4()
            var 消息: 发送消息 = {
                id: id,
                data: data,
            }
            await 发送函数(消息转字符串(消息))
            映射表[id] = {
                id: id,
                发送内容: data,
                返回内容: null,
                状态: '未回复',
            }
            return id
        },
        async 接收(data) {
            var 消息 = 字符串转消息(data) as 返回消息
            if (消息.id == null || typeof 消息.id != 'string') {
                throw '必须有id:' + data
            }
            if (映射表[消息.id] == null) {
                throw '这个id没有被发送:' + 消息.id
            }

            映射表[消息.id].状态 = '已回复'
            映射表[消息.id].返回内容 = 消息.data
        },
        async 消费(id: string, 超时时间: number = 0) {
            return new Promise((res, rej) => {
                if (映射表[id] == null) {
                    rej('这个id没有被发送:' + id)
                }

                var 轮询时间 = 100
                var 运行次数 = 0

                function f() {
                    运行次数++
                    if (超时时间 != 0 && 运行次数 * 轮询时间 >= 超时时间) {
                        return rej('超时:' + JSON.stringify({ id: 映射表[id].id, 发送内容: 映射表[id].发送内容 }))
                    }
                    if (映射表[id].状态 == '已回复') {
                        return res(映射表[id].返回内容)
                    }
                    setTimeout(f, 100)
                }
                f()
            })
        },
    }

    return r
}
