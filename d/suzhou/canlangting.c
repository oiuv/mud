inherit ROOM;
string look_duilian();

#include <ansi.h>;

void create()
{
	set("short", "沧浪亭");
	set("long", @LONG
沧浪亭在苏州的北大街南侧，因为环境相对幽雅，使得男
女老少都喜爱在这里闲庭散步。在亭中放眼望去，四周一片碧
绿的草坪，亭子翼然于耸翠之中，飞檐凌空琵琶形牌科，布满
檐口四周，亭上的额匾和石柱上的楹联(lian)使人更加喜爱这
里。
LONG );
	set("outdoors", "suzhou");
        set("item_desc",([
                "lian" : (: look_duilian :), //清风明月本无价 近水远山皆有情
        ]));
	set("exits", ([
		"north" : __DIR__"beidajie1",
		"south" : __DIR__"zhongxin",
	]));
	set("objects", ([
		"/adm/npc/hongniang" : 1,
	]));
	setup();
}

string look_duilian()
{
        return
        HIC "\n"
        "             ※※※※※※※            ※※※※※※※\n"
        "             ※※※※※※※            ※※※※※※※\n"
        "             ※※      ※※            ※※      ※※\n"
        "             ※※" NOR + HIW "　清　" NOR + HIC "※※            ※※" NOR + HIW "  近  " NOR + HIC "※※\n"
        "             ※※　 　 ※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  风  " NOR + HIC "※※            ※※" NOR + HIW "  水  " NOR + HIC "※※\n"
        "             ※※      ※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  明  " NOR + HIC "※※            ※※" NOR + HIW "  远  " NOR + HIC "※※\n"
        "             ※※      ※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  月  " NOR + HIC "※※            ※※" NOR + HIW "  山  " NOR + HIC "※※\n"
        "             ※※      ※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  本  " NOR + HIC "※※            ※※" NOR + HIW "  皆  " NOR + HIC "※※\n"
        "             ※※    　※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  无  " NOR + HIC "※※            ※※" NOR + HIW "  有  " NOR + HIC "※※\n"
        "             ※※    　※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  价  " NOR + HIC "※※            ※※" NOR + HIW "  情  " NOR + HIC "※※\n"
        "             ※※    　※※            ※※      ※※\n"
        "             ※※※※※※※            ※※※※※※※\n"
        "             ※※※※※※※            ※※※※※※※\n\n" NOR;
}
