#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "坟墓内部");
	set("long", @LONG
这里放着一具棺材，大概就是墓碑上所写「凌霜华」的棺
材了。奇怪的是棺材已被打开，旁边放着棺盖(cover)。
LONG);

	set("exits", ([
		"north" : __DIR__"sec2",
	]));
	set("item_desc", ([
		"cover" : WHT "\n你抹去上面的灰尘，只看见上面竟然刻着些奇奇怪怪的数\n"
                          "字「" NOR + HIR "三十三" NOR + WHT "、" NOR + HIR "五"
                          "十七" NOR + WHT "、" NOR + HIR "一十八" NOR + WHT "、"
                          NOR + HIR "二十六" NOR + WHT "、" NOR + HIR "四十八" NOR
                          + WHT "……」 \n" NOR,
	]));

        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

