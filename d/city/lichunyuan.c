#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "丽春院");
	set("long", @LONG
你刚走进来，第一眼看到的就是大厅墙上挂着的一幅幅春
宫图(tu)，一下子就明白了这里是什么地方。只见厅内到处张
灯结彩，香气扑鼻。几名打扮得妖里妖气的女人分站两旁对你
发出媚笑。主人韦春芳上上下下、前前后后招呼着客人。从楼
上传来了阵阵打情骂俏的声音。
LONG);
	set("objects", ([
                __DIR__"npc/wei" : 1,
                __DIR__"npc/mao18" : 1, 
	]));

	set("item_desc", ([
		"tu" : HIR "\n\n
    ※※※※※※※※※※※※※※※※※※※※※※※
    ※※                                      ※※
    ※※" HIW "          Ο        Ο          Ο    " HIR "※※
    ※※" HIW "        ┌│        │          │    " HIR "※※
    ※※" HIW "        │┤      ┌┘          └┐  " HIR "※※
    ※※" HIW "  Ο——┘│  Ο—┼┴—  Ο——┴┼  " HIR "※※
    ※※                                      ※※
    ※※" HIW "  Ο       Ο   ΟΟΟ            ○  " HIR "※※
    ※※" HIW "  │       │   │├┼            │  " HIR "※※
    ※※" HIW "  ├ Ο┬┐┤   ├└┼┐  ○┬—┐┤  " HIR "※※
    ※※" HIW "  │   ┘└│   │  │      │  ││  " HIR "※※
    ※※                                      ※※
    ※※※※※※※※※※※※※※※※※※※※※※※\n\n\n" NOR
	]));

	set("exits", ([
		"west"  : __DIR__"nandajie2",
		"up"    : __DIR__"lichunyuan2",
	]));

	setup();
	replace_program(ROOM);
}
