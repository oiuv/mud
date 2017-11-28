
#include <room.h>
inherit ROOM;

void create()
{
        set("short", "花园");
        set("long", @LONG
这里是翰林府的花园。院子里种了各色名贵的菊花。黄菊有都胜、金
芍药、报君知。白菊有月下白、一团雪、貂蝉拜月。紫菊有双飞燕、紫玉
莲、玛瑙盘。红菊有美人红、醉贵妃、绣芙蓉。。。院中有几盆颜色特别
娇艳的黄花，花瓣黄得像金子一样，花朵的样子很像荷花。那就是从天竺
传来的金波旬花。
LONG );

        set("exits", ([
                "south" : __DIR__"dongxiang",
        ]));
        set("objects", ([
                __DIR__"npc/obj/juhua1" : 1,
        ]));
        setup();
}

int valid_leave(object me, string dir)
{
        if (!(me->query_temp("jinboxunhua"))
        && !wizardp(me)
        && userp(me) ) {
                me->receive_wound("qi", me->query("qi")+200);
                me->set_temp("die_reason", "中了金波旬花毒而死");
                return notify_fail("你突然头晕目旋摔倒在地。\n");
        } 
        return ::valid_leave(me, dir);
}

