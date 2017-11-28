#include <ansi.h>
inherit ROOM;

string look_duilian();

void create()
{
	set("short", "铃音阁");
        set("long", @LONG
此处是衡阳城唯一出售乐器的地方，店铺门口挂满了风铃，
微风吹过，玲音入耳，精神便为之一爽。进入店内，只见货柜
上摆满了各色乐器，琳琅满目，据说这里的老板娘以前是个歌
妓，虽然现在做起乐器生意，但偶尔也会拂琴高歌，每次都会
引来很多的路人驻足欣赏。门前挂着一幅对联(duilian)。
LONG);
	set("objects", ([
		__DIR__"npc/feiyan" : 1,
	]));

	set("exits", ([
		"south" : __DIR__"hengyang11",
	]));

	set("item_desc", ([
                "duilian" : (: look_duilian :),
	]));

	set("no_fight", 1);

	setup();
    //replace_program(ROOM);
		
}	

void init()
{
	tell_object(this_player(), HIW "\n你一走进玲音阁，风铃被你走路所带动"
                                   "的风吹得「叮叮」作响。\n\n" NOR);	
}

string look_duilian()
{
        return
        HIC "\n"
        "       ※※※※※※※         ※※※※※※※\n"
        "       ※※※※※※※         ※※※※※※※\n"
        "       ※※      ※※         ※※      ※※\n"
        "       ※※" HIW "　流　" HIC "※※         ※※" HIW "  空  " HIC "※※\n"
        "       ※※　 　 ※※         ※※      ※※\n"
        "       ※※" HIW "  泉  " HIC "※※         ※※" HIW "  谷  " HIC "※※\n"
        "       ※※      ※※         ※※      ※※\n"
        "       ※※" HIW "  水  " HIC "※※         ※※" HIW "  寂  " HIC "※※\n"
        "       ※※      ※※         ※※      ※※\n"
        "       ※※" HIW "  云  " HIC "※※         ※※" HIW "  寞  " HIC "※※\n"
        "       ※※      ※※         ※※      ※※\n"
        "       ※※" HIW "  清  " HIC "※※         ※※" HIW "  天  " HIC "※※\n"
        "       ※※      ※※         ※※      ※※\n"
        "       ※※" HIW "  音  " HIC "※※         ※※" HIW "  赖  " HIC "※※\n"
        "       ※※      ※※         ※※      ※※\n"
        "       ※※" HIW "  幽  " HIC "※※         ※※" HIW "  绝  " HIC "※※\n"
        "       ※※      ※※         ※※      ※※\n"
        "       ※※" HIW "  兰  " HIC "※※         ※※" HIW "  音  " HIC "※※\n"
        "       ※※    　※※         ※※      ※※\n"
        "       ※※※※※※※         ※※※※※※※\n"
        "       ※※※※※※※         ※※※※※※※\n\n" NOR;
}
