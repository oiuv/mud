//Room: yaopu.c

#include <ansi.h>

inherit ROOM;

void create ()
{
        set ("short", "回春堂药铺");
        set ("long", @LONG
这是长安城一家刚刚开张不久的药铺，相传原来的老板是江湖中最
神秘的医谷中的神医，手段可知一二。药铺中的摆设也十分考究，桌椅
被勤快的伙计擦的干干净净。墙上挂满了别人送来的谢匾(bian)。
LONG);
        set("item_desc", (["bian" : HIW" 妙手回春 \n\n"NOR, ]));
        set("exits", 
        ([ //sizeof() == 1
                "south" : __DIR__"qixiang6",
        ]));
        set("objects", 
        ([ //sizeof() == 1
                __DIR__"npc/doctor" : 1,
        ]));

	set("no_clean_up", 0);
        setup();
	replace_program(ROOM);
}
