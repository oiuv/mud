// Room: /d/shaolin/shijie11.c
// Date: YZC 96/01/19

inherit ROOM;

void create()
{
	set("short", "石阶");
	set("long", @LONG
松林渐渐开阔，面前出现了一条宽广的石板道，笔直通向前方。
沿道稀稀落落地种着几棵柏树，却显得高大挺拔，蝤龙般的枝干
向天空高高伸展着。
LONG );
	set("exits", ([
		"southdown" : __DIR__"shijie10",
		"north" : __DIR__"guangchang1",
	]));
	set("no_clean_up", 0);
	set("outdoors", "shaolin");
	setup();
}

int valid_leave(object me, string dir)
{
	if (me->query("id") == "seng bing" &&  dir == "southdown")
                return 0;

	return ::valid_leave(me, dir);
}

