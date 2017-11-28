inherit ROOM;

void create()
{
	set("short", "回雁楼");
	set("long", @LONG
这里是衡阳回雁楼，是本地最大的酒楼。往日这时已经十
分忙碌的酒楼今天却有点异样。一个年近四十的白衣汉子，正
端坐自饮，桌面横放着一把快刀，旁边却坐着一个小尼姑，满
脸忧急愁苦之色，容貌却十分秀丽。
LONG);
	set("exits", ([
	       "down" : __DIR__"shop",
	]));
	set("objects", ([
	        __DIR__"npc/tian"   : 1,
	        __DIR__"npc/yilin"  : 1,
	]));

        set("no_clean_up", 0);

	setup();
	replace_program(ROOM);
}

