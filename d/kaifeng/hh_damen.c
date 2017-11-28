inherit ROOM;

void create()
{
        set("short", "红花会大门");
        set("long", @LONG
这里便是红花会总舵所在了，一座红墙朱瓦的大宅映入眼
帘，门口放着两头石狮子，甚是威严。朱红大门的上铆钉闪闪
发光，门前站着几个红花会的弟子，赤裸着上身，胸前佩着朵
大红花，神情严肃。仔细的观察着每一个进出的人。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"north" : __DIR__"hh_lianwu1",
  		"south" : __DIR__"hh_qguangchang",
	]));
        set("objects", ([
                CLASS_D("honghua") + "/yang" : 1,
                CLASS_D("honghua") + "/jiang" : 1,
                __DIR__"npc/honghua2" : 4,
        ]));
        set("outdoors", "honghua");

        setup();
}

int valid_leave(object me, string dir)
{
        object guard;

        if (dir != "north" ||
            ! objectp(guard = present("yang chengxie", this_object())) &&
            ! objectp(guard = present("jiang sigen", this_object())))
                return ::valid_leave(me, dir);

        return guard->permit_pass(me, dir);
}
