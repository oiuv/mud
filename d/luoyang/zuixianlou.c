inherit ROOM;

void create()
{
	set("short", "望星楼");
	set("long", @LONG
望星楼共四层，高达三十余米，乃洛阳城中的一绝。方圆数百里内提
起望星楼可以说是无人不知，无人不晓。楼下为望星楼的大厅，非常的宽
广，玲珑八角，青砖砌地，好不气派。大厅西首一檀木制阶梯直通望星楼
的楼上的雅座。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"up" : __DIR__"zuixianlou2",
  		"west" : __DIR__"nroad1",
	]));
        set("objects", ([
                "/d/city/npc/xiaoer2" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
