//Room: kzsleep.c

#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "客店睡房");
        set("long", @LONG
客栈的一间睡房，房间里打扫得干干净净，不时的可以听到从隔壁
客房里传出呼呼的打酣声，墙角有一张软塌（ｂｅｄ），是供客人们休
息睡觉用的。
LONG
        );
        set("item_desc", ([ /* sizeof() == 1 */
        	"bed" : HIW "一张白色的软榻，看上去极为精致。\n" NOR,
        ]));
        set("exits", ([
        	"down" : __DIR__"kezhan",
        ]));

        set("no_fight", 1);
        setup();
}
void init()
{
        add_action("do_bed", "bed");
}
int do_bed()
{       object me;
        me=this_player();
        message_vision(HIY "$N掀开纱帐，准备上床了。\n\n" NOR, me);
        me->move(__DIR__"bed");
        message_vision(HIY "\n沙帐轻轻一动，$N钻了进来。\n" NOR, me);
        return 1;
}

int valid_leave(object me, string dir)
{
        me->delete_temp("rent_paid");
        return ::valid_leave(me, dir);
}
