//houyuan.c
inherit ROOM;
void create()
{
	set("short","后院");
	set("long",@LONG
这里是华山派的后院，里面是华山弟子的居室和练功房。华山派总所
倚山而建，地势险峻，往东便是悬崖。西面是另一个小花院，有假山小池，
景色怡人，颇有江南林园的特色。
LONG);
	set("exits",([
		"northeast"  : __DIR__"garden",
		"west"       : __DIR__"jiashan",
		"east"       : __DIR__"xuanya",
	]));
	set("outdoors", "huashan");
        set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}
 
