/*  intermud.h

    Copyright (C) 1994-2000 Annihilator <annihilator@muds.net>

    This program is a part of ES2 mudlib. Permission is granted to use,
    modify, copy or distribute this program provided this copyright notice
    remains intact and subject to the restriction that this program MAY
    NOT be used in any way for monetary gain.

    Details of terms and conditions is available in the Copyright.ES2 file.
    If you don't receive this file along with this program, write to the
    primary author of ES2 mudlib: Annihilator <annihilator@muds.net>
*/

#ifndef INTERMUD_H
#define INTERMUD_H

#define ENABLE_ANTISPAM

#ifndef MUDLIST_SERVER
#define MUDLIST_SERVER "118.190.104.241"
#define MUDLIST_SERVER_PORT 5567
#endif

#define MUDLIST_UPDATE_INTERVAL 1800

#define INTERMUD_UDP_PORT (MUD_PORT + 4)
#define INTERMUD_SERVICE(x) CORE_INTERMUD_SERVICE(x)

#define SECURED_INTERMUD_EVENT                        \
    if (previous_object() != load_object(INTERMUD_D)) \
    error("Permission denied.\n")

#define SECURED_INTERMUD_API                    \
    if (geteuid(previous_object()) != ROOT_UID) \
    error("Permission denied.\n")

/*  定義這個符號會讓 i2d 將系統收集到的 mudlist 存檔。
 */
#define SAVE_MUDLIST

/*  定義這個符號會讓 i2d 自動產生一個簡短的代號, 用來指定特定 mud。
 */
#define AUTO_ALIAS

#endif /* INTERMUD_H */
