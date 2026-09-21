HTTP 状态码备忘清单
===

HTTP 常用状态码与 REST API 返回码的快速参考。

HTTP 状态码
---

### 含义

- [1xx: 信息](#1xx-信息) _代表已收到请求并且该过程正在继续_<!--rehype:tooltips-->
- [2xx: 成功](#2xx-成功) _代表该操作已成功接收、理解和接受_<!--rehype:tooltips-->
- [3xx: 重定向](#3xx-重定向) _代表必须采取进一步行动才能完成请求_<!--rehype:tooltips-->
- [4xx: 客户端错误](#4xx-客户端错误) _代表请求包含不正确的语法或无法完成_<!--rehype:tooltips-->
- [5xx: 服务器错误](#5xx-服务器错误) _代表服务器未能满足明显有效的请求_<!--rehype:tooltips-->

### 2xx. 成功
<!--rehype:wrap-class=row-span-2-->

- [200: OK](https://tools.ietf.org/html/rfc7231#section-6.3.1) _请求成功_<!--rehype:tooltips-->
- [201: 已创建](https://tools.ietf.org/html/rfc7231#section-6.3.2) _请求成功，并创建了新的资源_<!--rehype:tooltips-->
- [202: 已接受](https://tools.ietf.org/html/rfc7231#section-6.3.3) _请求成功，但处理尚未完成_<!--rehype:tooltips-->
- [203: Non-Authoritative Information](https://tools.ietf.org/html/rfc7231#section-6.3.4) _请求成功，但负载经过了第三方服务器的修改，而非原始负载_<!--rehype:tooltips-->
- [204: No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5) _响应给出了状态码和标头，但响应中没有实体主体_<!--rehype:tooltips-->
- [205: Reset Content](https://tools.ietf.org/html/rfc7231#section-6.3.6) _请求成功，但浏览器应重置文档视图，比如清空表单内容、重置 canvas 状态或者刷新用户界面_<!--rehype:tooltips-->
- [206: Partial Content](https://tools.ietf.org/html/rfc7233#section-4.1) _请求成功，服务器正在返回请求所指定部分的数据。用于响应标头中指定了数据区间的请求。服务器必须使用 Content-Range 标头指定响应中包含的数据区间_<!--rehype:tooltips-->

### 4xx. 客户端错误
<!--rehype:wrap-class=row-span-3-->

- [400: Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1) _服务器不理解该请求_<!--rehype:tooltips-->
- [401: Unauthorized](https://tools.ietf.org/html/rfc7235#section-3.1) _请求缺少有效的认证凭据_<!--rehype:tooltips-->
- [402: Payment Required](https://tools.ietf.org/html/rfc7231#section-6.5.2) _您目前还不能使用此代码。402 状态码被创建最初用于表明请求的内容只有付费之后才能获取。目前不存在标准的使用约定_<!--rehype:tooltips-->
- [403: Forbidden](https://tools.ietf.org/html/rfc7231#section-6.5.3) _禁止了对于此页面的请求_<!--rehype:tooltips-->
- [404: Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4) _服务器找不到请求的页面_<!--rehype:tooltips-->
- [405: Method Not Allowed](https://tools.ietf.org/html/rfc7231#section-6.5.5) _请求中指定的方法不被允许_<!--rehype:tooltips-->
- [406: Not Acceptable](https://tools.ietf.org/html/rfc7231#section-6.5.6) _服务器只能生成客户端不接受的响应_<!--rehype:tooltips-->
- [407: Proxy Authentication Required](https://tools.ietf.org/html/rfc7235#section-3.2) _您必须先通过代理服务器进行身份验证，然后才能提供此请求_<!--rehype:tooltips-->
- [408: Request Timeout](https://tools.ietf.org/html/rfc7231#section-6.5.7) _请求花费的时间比服务器准备等待的时间长_<!--rehype:tooltips-->
- [409: Conflict](https://tools.ietf.org/html/rfc7231#section-6.5.8) _由于冲突，请求无法完成_<!--rehype:tooltips-->
- [410: Gone](https://tools.ietf.org/html/rfc7231#section-6.5.9) _请求的页面不再可用_<!--rehype:tooltips-->
- [411: Length Required](https://tools.ietf.org/html/rfc7231#section-6.5.10) _服务器拒绝未提供所需 `Content-Length` 的请求_<!--rehype:tooltips-->
- [412: Precondition Failed](https://tools.ietf.org/html/rfc7232#section-4.2) _请求中给出的前提条件被服务器评估为 false_<!--rehype:tooltips-->
- [413: Content Too Large](https://www.rfc-editor.org/rfc/rfc9110.html#name-413-content-too-large) _服务器拒绝处理内容过大的请求_<!--rehype:tooltips-->
- [414: URI Too Long](https://www.rfc-editor.org/rfc/rfc9110.html#name-414-uri-too-long) _服务器拒绝处理目标 URI 过长的请求_<!--rehype:tooltips-->
- [415: Unsupported Media Type](https://tools.ietf.org/html/rfc7231#section-6.5.13) _服务器不会接受请求，因为不支持媒体类型_<!--rehype:tooltips-->
- [416: Range Not Satisfiable](https://tools.ietf.org/html/rfc7233#section-4.4) _请求的字节范围不可用且超出范围_<!--rehype:tooltips-->
- [417: Expectation Failed](https://tools.ietf.org/html/rfc7231#section-6.5.14) _此服务器无法满足在 Expect 请求标头字段中给出的期望_<!--rehype:tooltips-->
- [426: Upgrade Required](https://tools.ietf.org/html/rfc7231#section-6.5.15) _服务器拒绝使用当前协议执行请求，但在客户端升级到不同协议后可能愿意这样做_<!--rehype:tooltips-->
- [451: Unavailable For Legal Reasons](https://datatracker.ietf.org/doc/html/rfc7725#section-3) _此状态代码表示服务器拒绝访问资源作为法律要求的结果_<!--rehype:tooltips-->

### 1xx. 信息

- [100: Continue](https://tools.ietf.org/html/rfc7231#section-6.2.1) _服务器只收到了请求的一部分，但只要没有被拒绝，客户端就应该继续请求_<!--rehype:tooltips-->
- [101: Switching Protocols](https://tools.ietf.org/html/rfc7231#section-6.2.2) _服务器切换协议_<!--rehype:tooltips-->
- [102: Processing](https://tools.ietf.org/html/rfc2518#section-10.1) _用于通知客户端服务器已接受完整请求但尚未完成的临时响应_<!--rehype:tooltips-->

### 3xx. 重定向

- [300: Multiple Choices](https://tools.ietf.org/html/rfc7231#section-6.4.1) _一个链接列表。 用户可以选择一个链接并转到该位置。 最多五个地址_<!--rehype:tooltips-->
- [301: Moved Permanently](https://tools.ietf.org/html/rfc7231#section-6.4.2) _请求的页面已移至新的 url_<!--rehype:tooltips-->
- [302: Found](https://tools.ietf.org/html/rfc7231#section-6.4.3) _请求的页面已临时移动到新的 url_<!--rehype:tooltips-->
- [303: See Other](https://tools.ietf.org/html/rfc7231#section-6.4.4) _请求的页面可以在不同的 url 下找到_<!--rehype:tooltips-->
- [304: Not Modified](https://tools.ietf.org/html/rfc7232#section-4.1) _这是对 If-Modified-Since 或 If-None-Match 标头的响应代码，其中 URL 自指定日期以来未修改_<!--rehype:tooltips-->
- [305: Use Proxy](https://www.rfc-editor.org/rfc/rfc9110.html#name-305-use-proxy) _已弃用；不应使用此状态码配置代理。_<!--rehype:tooltips-->
- [306: Unused](https://www.rfc-editor.org/rfc/rfc9110.html#name-306-unused) _此代码已不再使用，且被保留，新的实现不应使用它。_<!--rehype:tooltips-->
- [307: Temporary Redirect](https://tools.ietf.org/html/rfc7231#section-6.4.7) _请求的页面已临时移动到新的 url_<!--rehype:tooltips-->
- [308: Permanent Redirect](https://www.rfc-editor.org/rfc/rfc9110.html#name-308-permanent-redirect) _资源已永久移动到新的 URI；客户端重定向时不得修改请求方法。_<!--rehype:tooltips-->

### 5xx. 服务器错误

- [500: Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1) _请求未完成。服务器遇到了意外情况_<!--rehype:tooltips-->
- [501: Not Implemented](https://tools.ietf.org/html/rfc7231#section-6.6.2) _请求未完成。服务器不支持所需的功能_<!--rehype:tooltips-->
- [502: Bad Gateway](https://tools.ietf.org/html/rfc7231#section-6.6.3) _请求未完成。服务器收到来自上游服务器的无效响应_<!--rehype:tooltips-->
- [503: Service Unavailable](https://tools.ietf.org/html/rfc7231#section-6.6.4) _请求未完成。服务器暂时超载或停机_<!--rehype:tooltips-->
- [504: Gateway Timeout](https://tools.ietf.org/html/rfc7231#section-6.6.5) _网关已超时_<!--rehype:tooltips-->
- [505: HTTP Version Not Supported](https://tools.ietf.org/html/rfc7231#section-6.6.6) _服务器不支持“http 协议”版本_<!--rehype:tooltips-->

### RESTful API

 :- | -
---- | ----
`200` | 请求成功，通常返回资源表示
`201` | 资源创建成功，常用于 `POST`
`204` | 请求成功且无响应体，常用于 `DELETE`
`301` | 永久重定向
`302/307` | 临时重定向；`307` 不改变请求方法
`308` | 永久重定向且不改变请求方法
`304` | 未修改，自上次请求以来
`400` | 错误请求，缺少 API 请求的必需属性
`401` | 缺少或无效的认证凭据
`403` | 服务器理解请求，但拒绝执行
`404` | 资源不存在或不可用
`405` | 资源不支持该请求方法
`409` | 请求与资源当前状态冲突
`412` | 请求前置条件不成立
`422` | 服务器理解请求内容，但无法处理其中的指令
`429` | 请求过多，已超过速率限制
`500` | 服务器处理请求时遇到意外错误

另见
----

- [常见 HTTP/FTP/WebSocket 错误代码大全](https://jaywcjlove.github.io/handbook/other/HTTP-status-codes.html) _(github.io)_
- [HTTP 状态码列表](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes) _(wikipedia.org)_
- [FTP 状态码列表](https://en.wikipedia.org/wiki/List_of_FTP_server_return_codes) _(wikipedia.org)_
- [HTTP 404](https://en.wikipedia.org/wiki/HTTP_404#Custom_error_pages) _(wikipedia.org)_
- [HTTP概述](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Overview) _(mozilla.org)_
- [实用的 RESTful API 最佳实践](https://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api) _(vinaysahni.com)_
