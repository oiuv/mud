/*  mudlib.h

    Copyright (C) 1994-2000 Annihilator <annihilator@muds.net>

    This program is a part of ES2 mudlib. Permission is granted to use,
    modify, copy or distribute this program provided this copyright notice
    remains intact and subject to the restriction that this program MAY
    NOT be used in any way for monetary gain.

    Details of terms and conditions is available in the Copyright.ES2 file.
    If you don't receive this file along with this program, write to the
    primary author of ES2 mudlib: Annihilator <annihilator@muds.net>
*/

#ifndef __MUDLIB_H
#define __MUDLIB_H

/* 這個是 mudlib 的名稱，除非你徵詢過原作者的同意，否則你不應該修改這個
 * 名稱。這個名稱除了用來識別 mudlib 的系統之外，也用在 intermud 協定中
 * 的 es 頻道，作為各 MUD 間溝通訊息之用。
 */
#ifndef MUDLIB_NAME
#define MUDLIB_NAME "MUDCORE"
#endif
/* 這個是 mudlib 的版本號碼，ES2 mudlib 在釋出新版的時候會提昇其版本號碼
 * 中的數字部分，數字後面接的字母其意義如下：
 *	p: 原型版 (prototype)，實驗用。
 *	a: 內部測試版 (alpha)，釋出供有架站經驗者測試用。
 *	b: 公開測試版 (beta)，釋出供一般使用者測試用。
 *	(無): 正式版，含 mudlib 函數說明及介面規格。
 */
#ifndef MUDLIB_VERSION_NUMBER
#define MUDLIB_VERSION_NUMBER "v2020"
#endif
#define MUDLIB_VERSION (MUDLIB_NAME + " " + MUDLIB_VERSION_NUMBER)

/* 這是你的 MUD 使用的中文編碼系統，預設為台灣地區常用的 BIG5，大陸地區通
 * 常使用 GB 碼，ES2 mudlib 釋出時以 BIG5 碼為主，如果有人願意轉碼成 GB 版
 * 歡迎和我聯絡。
 */
#ifndef MUDLIB_LOCALE
#define MUDLIB_LOCALE "UTF-8"
#endif
/* 這個名稱是在 intermud 上的 mud 名稱，由於 intermud 會和國際上的其他 mud
 * 相通連，所以請勿使用 ASCII 以外的字元(中文碼)。
 */
#ifndef INTERMUD_MUD_NAME
#define INTERMUD_MUD_NAME "MUDCORE"
#endif

#define MUD_PORT __PORT__

#define MUD_NAME_INTERMUD MUD_NAME
#define MUD_NAME_ABBR MUD_NAME
#define MUD_HOSTNAME query_host_name()

#endif /* __MUDLIB_H */
