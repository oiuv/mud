#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "客栈");
        set("long", @LONG
这是一家价简陋客栈，店铺虽然不大，生意却不错，许多
过往的人都喜欢选择这里落脚，因为这里的店主识得一些江湖
中人，所以很少有人会来此闹事。店中的小二忙前忙后不停的
招呼着客人，就连店主也是满脸笑容的陪着说好话。让人觉的
有归家的感觉一般。
LONG);
        set("no_fight", 1);
        set("valid_startroom", 1);
        set("no_sleep_room", 1);
        set("objects", ([
                __DIR__"npc/xiaoer" : 1,
                __DIR__"npc/laoban" : 1,
        ]));
        set("exits", ([
                "west" : __DIR__"majiu",
                "east" : __DIR__"nandajie2",
                "westup" : __DIR__"kedian1",
        ]));
        setup();
}

int valid_leave(object me, string dir)
{

        if (! me->query_temp("rent_paid") && dir == "westup" )
        return notify_fail(CYN "元财对你赔笑道：这位客官，请先这里"
                           "付了钱再上楼住店。\n" NOR);
        return ::valid_leave(me, dir);
}
