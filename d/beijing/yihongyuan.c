inherit ROOM;

void create()
{
	set("short", "怡红院");
	set("long", @LONG
你一走进来，一眼就看到大厅的墙上挂着一幅幅春宫图，一下子就明白了
这是什么地方。厅内到处张灯结彩，香气扑鼻。几名打扮得妖里妖气的女人分
站两旁对你发出媚笑。一个老鸨婆连忙上前招呼客人。从楼上传来了阵阵打情
骂俏的声音。
LONG );
	set("exits", ([
		"west" : __DIR__"wang_8",
	]));

	set("objects", ([
                __DIR__"npc/laobaopo" : 1,
                __DIR__"npc/piaoke" : 1,
                __DIR__"npc/jinv" : 2,
	]));

	setup();
	replace_program(ROOM);
}

