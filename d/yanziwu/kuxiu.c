//ROOM: /d/yanziwu/kuxiu.c

inherit ROOM;

void create()
{
        set("short", "苦修场");
        set("long",@LONG
这里的场地有些破落，虽然经常打扫，但是场地仍然看得
出不少痕迹。希望出人头地的慕容家弟子在武功有了一定的修
为以后往往到这里来作进一步的修行。
LONG );
        set("outdoors", "yanziwu");
        set("exits", ([
                "west" : __DIR__"shijian",
		"east":  __DIR__"kuxiu2",
        ]));

        set("for_family", "慕容世家");
        setup();
	replace_program(ROOM);
}

