inherit ROOM;

void create()
{
        set("short", "舍利塔");
        set("long",@LONG
这是天龙三塔中最高的一座，高约三百余尺，共有十六级。相传塔顶
原本供奉着一颗前代高僧的舍利子，但在当年奸臣杨义贞弑上德帝篡位以
至天下大乱时，舍利子不知何因而失踪了，这也成为天龙寺历代主持的心
腹大事。这个传言也不知是真是假。
LONG
        );
        set("outdoors", "tianlongsi");
        set("exits", ([
                "south" : __DIR__"baodian",
		"east" : __DIR__"wuwoge",
		"west" : __DIR__"wujingge",
                "north" : __DIR__"talin",
//		"up" :__DIR__"floor1",
        ]));
	set("objects",([
                __DIR__"npc/hutaseng1" : 1,
        ]));
//        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
