// Room: /qingcheng/huyingting.c
// Date: Frb.20 1998 by Java

inherit ROOM;
void create()
{
	set("short", "呼应亭");
	set("long", @LONG
呼应亭高居彭祖峰顶，是青城最高处。登临长啸，余音回荡，
众山皆应。看雪岭光腾，红吞沧海，锦江春涨，绿到瀛洲。夏日夜
分，有圣灯浮云，传说是神仙朝贺张天师所点仙灯，看来让人感叹
不已。
LONG );
        set("outdoors","qingcheng");
	set("exits", ([
		"eastdown" : __DIR__"shangqing",
	]));
	set("objects", ([
		__DIR__"npc/hou" : 1,
	]));
//	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

