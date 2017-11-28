inherit ROOM;

void create()
{
	set("short","南河桥");
	set("long",@LONG
这里是成都南门外南河桥。府河和南河夹城流过，成为天
然的护城河，滋润着这个天府之国的川中首府。向北进城，向
南又是一条小路。
LONG);
	set("outdoors", "chengdu");
	set("exits", ([
                "south"  : "/d/xuedao/sroad1",
                "north"  : __DIR__"southgate",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

