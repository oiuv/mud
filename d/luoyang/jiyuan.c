inherit ROOM;

void create()
{
	set("short", "春月楼");
	set("long", @LONG
此楼虽不在京城，但却是中原最有名的青楼。这里有最贵的酒，最华
丽的摆设，也有最优质的服务，更有最贵的女人，最风骚且最有味的女人。
当然，前提是你要有足够的钱！楼内到处张灯结彩，香气扑鼻。老鸨正忙
的不亦乐乎，几名打扮得妖里妖气的女人分站两旁对你发出媚笑。从楼上
传来了阵阵打情骂俏的声音。朱红大门上高悬一块御赐金匾：春色满园。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"up" : __DIR__"jiyuan2",
  		"west" : __DIR__"sroad5",
	]));
        set("objects", ([
                __DIR__"npc/laobao" : 1,
                "/d/beijing/npc/jinv" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
