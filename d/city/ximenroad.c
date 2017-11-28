inherit ROOM;

string look_gaoshi();

void create()
{
    	set("short", "西门大道");
	set("long", @LONG
这里是扬州西城门外大道。西通洛阳城，向东就是西门了。
南边，新开了个武道大会场，每到比武之期，人声鼎沸，你不
禁想去见识一下当今的成名人物。
LONG );
        set("outdoors", "city");
	set("exits", ([
		"east"  : __DIR__"ximen",
  		"west"  : "/d/changan/road8",
		"south" : __DIR__"wudao4",
                "southwest" : "/d/jingzhou/road1",
	]));
        set("objects", ([
                "/d/village/npc/boy" : 3,
        ]));
	setup();
}

int valid_leave(object me, string dir)
{
//	object obj;
	if (dir == "south") me->set_temp("view_leitai", 1);
        return ::valid_leave(me, dir);
}
