// tiejiangpu.c
// Date: Nov.1997 by Venus
#include <room.h>
inherit ROOM;
void create()
{
        set("short", "铁匠铺");
        set("long", @LONG
这是一家不小的打铁铺，店里摆了几座火炉，一位铁匠正在火炉
旁满头大汗地打造东西。一位老者坐在边上。火炉边放着不少打好了
的铁器。
LONG);
///    门口挂着一块牌子(paizi)。
        set("exits", ([ /* sizeof() == 2 */
            "west" : __DIR__"road11",
        ]));
        set("item_desc", ([
            "cannotsawpaizi" :
"若要'铸剑'，请找欧冶师傅。\n"
"如果想在你的兵器上刻下带色的字，可以在宝剑名\n"
"前面加上$XXX$，在宝剑名后记得恢复为$NOR$。\n"
"$BLK$ - 黑色            $NOR$ - 恢复正常颜色\n"
"$RED$ - 红色            $HIR$ - 亮红色\n"
"$GRN$ - 绿色            $HIG$ - 亮绿色\n"
"$YEL$ - 土黄色          $HIY$ - 黄色\n"
"$BLU$ - 深蓝色          $HIB$ - 蓝色\n"
"$MAG$ - 浅紫色          $HIM$ - 粉红色\n"
"$CYN$ - 蓝绿色          $HIC$ - 天青色\n"
"$WHT$ - 浅灰色          $HIW$ - 白色\n",
        ]));
        set("objects", ([ /* sizeof() == 1 */
//            __DIR__"npc/ouyezi" : 1,
            __DIR__"npc/smith" : 1,
        ]));
//        set("no_clean_up", 0);
        setup();
}
int valid_leave(object me, string dir)
{
        me=this_player();
        if (dir == "west")
        if((int)me->query_temp("marks/ouyezi"))
        {
           return notify_fail("铁匠对你道：哎，这位客官，拿了兵器再走！\n");
        }
        return 1;
}
