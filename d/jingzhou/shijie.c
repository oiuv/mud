inherit ROOM;

void create()
{
	set("short", "石阶");
	set("long", @LONG
这里是一排青石铺砌的石阶，往北可以通往萧湘书院，往
南则是一片翠绿的竹林。
LONG);
        set("outdoors", "jingzhou");
	set("exits", ([
		"southdown" : __DIR__"zizhulin",
		"north" : __DIR__"shuyuan1",
	]));
	setup();
	replace_program(ROOM);
}

