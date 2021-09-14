function guid2() {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    }
    return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4()
}

async function 等待(条件: () => boolean, 超时时间: number = 5000, 轮询时间: number = 100) {
    return new Promise((res, rej) => {
        var 计数器 = 0
        function f() {
            计数器++
            if (超时时间 != 0 && 计数器 * 轮询时间 >= 超时时间) return rej('等待超时')
            if (条件()) return res(null)
            setTimeout(f, 轮询时间)
        }
        f()
    })
}

export interface 消息管理者<A, B> {
    发送: (data: 发送消息实体<A>) => Promise<消息id>
    接收: (data: 返回消息<B>) => Promise<void>
    消费: (消息id: 消息id, 超时时间?: number, 轮询时间?: number) => Promise<返回消息实体<B>>
    id存在: (消息id: 消息id) => boolean
}

type 消息id = string
type 发送消息实体<A> = A
type 返回消息实体<A> = A
type 返回消息错误 = string
type 通道名称 = string
export interface 发送消息<A> {
    id: 消息id
    data: 发送消息实体<A>
    通道名称: 通道名称
}
export interface 返回消息<A> {
    id: 消息id
    err: 返回消息错误 | null
    data: 返回消息实体<A>
    通道名称: 通道名称
}

export default function 通信管理者<A, B>(发送函数: (a: 发送消息<A>) => Promise<void>, 通道名称: 通道名称) {
    var 映射表: { [消息id: string]: 返回消息<B> } = {}
    var r: 消息管理者<A, B> = {
        async 发送(data: A) {
            var id = guid2()
            var 消息: 发送消息<A> = { id, data, 通道名称: 通道名称 }
            await 发送函数(消息)
            return id
        },
        async 接收(data: 返回消息<B>) {
            if (data.通道名称 != 通道名称) return
            if (映射表[data.id] != null) return
            映射表[data.id] = data
        },
        async 消费(id: 消息id, 超时时间: number = 5000, 轮询时间: number = 100) {
            await 等待(() => 映射表[id] != null, 超时时间, 轮询时间)
            if (映射表[id] == null) throw '不可能到这里'
            if (映射表[id].err != null) throw 映射表[id].err
            return 映射表[id].data
        },
        id存在(id) {
            return 映射表[id] != null
        },
    }

    return r
}
