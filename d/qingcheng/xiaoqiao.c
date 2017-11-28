// Room: /qingcheng/xiaoqiao.c
// Date: Frb.20 1998 by Java

inherit ROOM;
void create()
{
	set("short", "小桥");
	set("long", @LONG
小桥横跨小溪上。溪水清澈，游鱼卵石斑驳可数。桥北面就是
青城建福宫了。青城是道家发轫之处，号道教的“第五洞天”，相
传东汉张陵在此结庐传授五斗米道，至今宫阙连绵，传道嗣法不绝。
LONG );
        set("outdoors","qingcheng");
	set("exits", ([
		"south" : __DIR__"qcroad3",
		"north" : __DIR__"jianfugong",
	]));

        set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

