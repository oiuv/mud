inherit ROOM;

void create()
{
        set("short", "西厢房");
        set("long", @LONG
这是县太爷府里供下人居住的地方。屋内没什么东西，只
有一张桌子和几张竹凳。屋角的盆里放着一大堆的衣服。有几
个丫鬟没事正在绣花。
LONG);
        set("exits", ([
                "east" : __DIR__"huayuan",
                                 
        ]));

        set("objects", ([
	        __DIR__"npc/yahuan" : 2,
        ]));

        setup();
        replace_program(ROOM);
}
