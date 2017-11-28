inherit ROOM;

void create()
{
	set("short", "王府大门");
	set("long", @LONG
你站在一座豪华的王府大门前，门前有两只极大的石狮
子，门上高悬一块横匾，上书「镇南王府」四个金字。门口
站着两排侍卫，身着锦衣，手执钢刀，气宇轩昂。
LONG);
	set("objects", ([
	   	CLASS_D("duan") + "/chu" : 1,
	   	__DIR__"npc/weishi1" : 2,
	]));
	set("valid_startroom", 1);
        set("no_sleep_room", 1);
	set("outdoors", "dali");
	set("exits", ([
	    	"enter"  : __DIR__"wfdating",
	    	"south"  : __DIR__"wangfulu",
	]));
	setup();
	"/clone/board/dali_b"->foo();
}

int valid_leave(object me, string dir)
{
        object ob;
        if (dir == "enter" && ob = present("chu wanli", this_object()))
                return ob->permit_pass(me, dir);

        return ::valid_leave(me, dir);
}
